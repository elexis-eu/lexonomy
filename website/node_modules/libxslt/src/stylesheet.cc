#include <node.h>
#include <nan.h>

#include "./stylesheet.h"

using namespace v8;

Nan::Persistent<Function> Stylesheet::constructor;

Stylesheet::Stylesheet(xsltStylesheetPtr stylesheetPtr) : stylesheet_obj(stylesheetPtr) {}

Stylesheet::~Stylesheet()
{
    xsltFreeStylesheet(stylesheet_obj);
}

void Stylesheet::Init(Handle<Object> exports) {
	 // Prepare constructor template
    Local<FunctionTemplate> tpl = Nan::New<FunctionTemplate>();
    tpl->SetClassName(Nan::New<String>("Stylesheet").ToLocalChecked());
  	tpl->InstanceTemplate()->SetInternalFieldCount(1);
  	
    constructor.Reset(tpl->GetFunction());
}

// not called from node, private api
Local<Object> Stylesheet::New(xsltStylesheetPtr stylesheetPtr) {
    Nan::EscapableHandleScope scope;
    Local<Object> wrapper = Nan::New(constructor)->NewInstance();
    Stylesheet* stylesheet = new Stylesheet(stylesheetPtr);
    stylesheet->Wrap(wrapper);
    return scope.Escape(wrapper);
}
