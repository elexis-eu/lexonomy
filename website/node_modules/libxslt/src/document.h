// Very simple v8 wrapper for xml document, see "Wrapping C++ objects" section here http://nodejs.org/api/addons.html

#ifndef SRC_DOCUMENT_H_
#define SRC_DOCUMENT_H_

#include <libxslt/xslt.h>
#include <libxslt/transform.h>
#include <libxslt/xsltutils.h>
#include <libexslt/exslt.h>

class Document : public Nan::ObjectWrap {
	public:
	    static void Init(v8::Handle<v8::Object> exports);
	    static v8::Local<v8::Object> New(xmlDocumentPtr DocumentPtr);
	    static NAN_METHOD(TransformSync);
	    xmlDocumentPtr Document_obj;

	private:
	    explicit Document(xmlDocumentPtr DocumentPtr);
	    ~Document();
	    static Nan::Persistent<v8::Function> constructor;
};

#endif  // SRC_DOCUMENT_H_