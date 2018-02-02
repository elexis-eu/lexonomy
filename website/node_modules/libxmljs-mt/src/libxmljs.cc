// Copyright 2009, Squish Tech, LLC.

#include <v8.h>

#include <libxml/xmlmemory.h>

#include "libxmljs.h"
#include "xml_document.h"
#include "xml_node.h"
#include "xml_sax_parser.h"
#include "xml_namespace.h"

namespace libxmljs {

// track how many nodes haven't been freed
int nodeCount = 0;

bool tlsInitialized = false;
Nan::nauv_key_t tlsKey;
bool isAsync = false; // Only set on V8 thread when no workers are running
int numWorkers = 0; // Only access from V8 thread
ssize_t memSize = 0; // Mainly for testing

struct memHdr {
    size_t size;
    double data;
};

#define HDR_SIZE offsetof(memHdr, data)

inline void* hdr2client(memHdr* hdr) {
    return static_cast<void*>(reinterpret_cast<char*>(hdr) + HDR_SIZE);
}

inline memHdr* client2hdr(void* client) {
    return reinterpret_cast<memHdr*>(static_cast<char*>(client) - HDR_SIZE);
}

inline void actuallyAdjustMem(ssize_t diff)
{
    memSize += diff;
    Nan::AdjustExternalMemory(diff);
}

void adjustMem(ssize_t diff)
{
    if (isAsync)
    {
        WorkerSentinel* worker =
            static_cast<WorkerSentinel*>(Nan::nauv_key_get(&tlsKey));
        if (worker)
        {
            worker->parent.memAdjustments += diff;
            return;
        }
    }
    // if v8 is no longer running, don't try to adjust memory
    // this happens when the v8 vm is shutdown and the program is exiting
    // our cleanup routines for libxml will be called (freeing memory)
    // but v8 is already offline and does not need to be informed
    // trying to adjust after shutdown will result in a fatal error
#if (NODE_MODULE_VERSION > 0x000B)
    if (v8::Isolate::GetCurrent() == 0)
    {
        assert(diff <= 0);
        return;
    }
#endif
    if (v8::V8::IsDead())
    {
        assert(diff <= 0);
        return;
    }
    actuallyAdjustMem(diff);
}

void* memMalloc(size_t size)
{
    size_t totalSize = size + HDR_SIZE;
    memHdr* mem = static_cast<memHdr*>(malloc(totalSize));
    if (!mem) return NULL;
    mem->size = size;
    adjustMem(totalSize);
    return hdr2client(mem);
}

void memFree(void* p)
{
    if (!p) return;
    memHdr* mem = client2hdr(p);
    ssize_t totalSize = mem->size + HDR_SIZE;
    adjustMem(-totalSize);
    free(mem);
}

void* memRealloc(void* ptr, size_t size)
{
    if (!ptr) return memMalloc(size);
    memHdr* mem1 = client2hdr(ptr);
    ssize_t oldSize = mem1->size;
    memHdr* mem2 = static_cast<memHdr*>(realloc(mem1, size + HDR_SIZE));
    if (!mem2) return NULL;
    mem2->size = size;
    adjustMem(ssize_t(size) - oldSize);
    return hdr2client(mem2);
}

char* memStrdup(const char* str)
{
    size_t size = strlen(str) + 1;
    char* res = static_cast<char*>(memMalloc(size));
    if (res) memcpy(res, str, size);
    return res;
}

// Set up in V8 thread
WorkerParent::WorkerParent() : memAdjustments(0) {
    if (!tlsInitialized)
    {
        Nan::nauv_key_create(&tlsKey);
        tlsInitialized = true;
    }
    if (numWorkers++ == 0)
    {
        isAsync = true;
    }
}

// Tear down in V8 thread
WorkerParent::~WorkerParent() {
    actuallyAdjustMem(memAdjustments);
    if (--numWorkers == 0)
    {
        isAsync = false;
    }
}

// Set up in worker thread
WorkerSentinel::WorkerSentinel(WorkerParent& parent) : parent(parent) {
    Nan::nauv_key_set(&tlsKey, this);
    xmlMemSetup(memFree, memMalloc, memRealloc, memStrdup);
}

// Tear down in worker thread
WorkerSentinel::~WorkerSentinel() {
    Nan::nauv_key_set(&tlsKey, NULL);
}

void deregisterNsList(xmlNs* ns)
{
    while (ns != NULL) {
        if (ns->_private != NULL) {
            XmlNamespace* wrapper = static_cast<XmlNamespace*>(ns->_private);
            wrapper->xml_obj = NULL;
            ns->_private = NULL;
        }
        ns = ns->next;
    }
}

void deregisterNodeNamespaces(xmlNode* xml_obj)
{
    xmlNs* ns = NULL;
    if ((xml_obj->type == XML_DOCUMENT_NODE) ||
#ifdef LIBXML_DOCB_ENABLED
        (xml_obj->type == XML_DOCB_DOCUMENT_NODE) ||
#endif
        (xml_obj->type == XML_HTML_DOCUMENT_NODE)) {
        ns = reinterpret_cast<xmlDoc*>(xml_obj)->oldNs;
    }
    else if ((xml_obj->type == XML_ELEMENT_NODE) ||
             (xml_obj->type == XML_XINCLUDE_START) ||
             (xml_obj->type == XML_XINCLUDE_END)) {
        ns = xml_obj->nsDef;
    }
    if (ns != NULL) {
        deregisterNsList(ns);
    }
}

/*
 * Before libxmljs nodes are freed, they are passed to the deregistration
 * callback, (configured by `xmlDeregisterNodeDefault`).
 *
 * In deregistering each node, we update any wrapper (e.g. `XmlElement`,
 * `XmlAttribute`) to ensure that when it is destroyed, it doesn't try to
 * access the freed memory.
 *
 * Because namespaces (`xmlNs`) attached to nodes are also freed and may be
 * wrapped, it is necessary to update any wrappers (`XmlNamespace`) which have
 * been created for attached namespaces.
 */
void xmlDeregisterNodeCallback(xmlNode* xml_obj)
{
    nodeCount--;
    deregisterNodeNamespaces(xml_obj);
    if (xml_obj->_private != NULL)
    {
        static_cast<XmlNode*>(xml_obj->_private)->xml_obj = NULL;
        xml_obj->_private = NULL;
    }
    return;
}

// this is called for any created nodes
void xmlRegisterNodeCallback(xmlNode* xml_obj)
{
    nodeCount++;
}

// ensure destruction at exit time
// v8 doesn't cleanup its resources
LibXMLJS LibXMLJS::instance;

LibXMLJS::LibXMLJS()
{
    // set the callback for when a node is created
    xmlRegisterNodeDefault(xmlRegisterNodeCallback);

    // set the callback for when a node is about to be freed
    xmlDeregisterNodeDefault(xmlDeregisterNodeCallback);

    // Setup our own memory handling (see xmlmemory.h/c)
    xmlMemSetup(memFree, memMalloc, memRealloc, memStrdup);

    // initialize libxml
    LIBXML_TEST_VERSION;
}

LibXMLJS::~LibXMLJS()
{
    xmlCleanupParser();
}

v8::Local<v8::Object> listFeatures() {
    Nan::EscapableHandleScope scope;
    v8::Local<v8::Object> target = Nan::New<v8::Object>();
#define FEAT(x) Nan::Set(target, Nan::New<v8::String>(# x).ToLocalChecked(), \
                    Nan::New<v8::Boolean>(xmlHasFeature(XML_WITH_ ## x)))
    // See enum xmlFeature in parser.h
    FEAT(THREAD);
    FEAT(TREE);
    FEAT(OUTPUT);
    FEAT(PUSH);
    FEAT(READER);
    FEAT(PATTERN);
    FEAT(WRITER);
    FEAT(SAX1);
    FEAT(FTP);
    FEAT(HTTP);
    FEAT(VALID);
    FEAT(HTML);
    FEAT(LEGACY);
    FEAT(C14N);
    FEAT(CATALOG);
    FEAT(XPATH);
    FEAT(XPTR);
    FEAT(XINCLUDE);
    FEAT(ICONV);
    FEAT(ISO8859X);
    FEAT(UNICODE);
    FEAT(REGEXP);
    FEAT(AUTOMATA);
    FEAT(EXPR);
    FEAT(SCHEMAS);
    FEAT(SCHEMATRON);
    FEAT(MODULES);
    FEAT(DEBUG);
    FEAT(DEBUG_MEM);
    FEAT(DEBUG_RUN);
    FEAT(ZLIB);
    FEAT(ICU);
    FEAT(LZMA);
    return scope.Escape(target);
}

NAN_METHOD(XmlMemUsed)
{
  Nan::HandleScope scope;
  return info.GetReturnValue().Set(Nan::New<v8::Int32>(int32_t(memSize)));
}

NAN_METHOD(XmlNodeCount)
{
  Nan::HandleScope scope;
  return info.GetReturnValue().Set(Nan::New<v8::Int32>(nodeCount));
}

NAN_MODULE_INIT(init)
{
      Nan::HandleScope scope;

      XmlDocument::Initialize(target);
      XmlSaxParser::Initialize(target);

      Nan::Set(target, Nan::New<v8::String>("libxml_version").ToLocalChecked(),
                  Nan::New<v8::String>(LIBXML_DOTTED_VERSION).ToLocalChecked());

      Nan::Set(target, Nan::New<v8::String>("libxml_parser_version").ToLocalChecked(),
                  Nan::New<v8::String>(xmlParserVersion).ToLocalChecked());

      Nan::Set(target, Nan::New<v8::String>("libxml_debug_enabled").ToLocalChecked(),
                  Nan::New<v8::Boolean>(debugging));

      Nan::Set(target, Nan::New<v8::String>("features").ToLocalChecked(), listFeatures());

      Nan::Set(target, Nan::New<v8::String>("libxml").ToLocalChecked(), target);

      Nan::SetMethod(target, "xmlMemUsed", XmlMemUsed);

      Nan::SetMethod(target, "xmlNodeCount", XmlNodeCount);
}

NODE_MODULE(xmljs, init)

}  // namespace libxmljs
