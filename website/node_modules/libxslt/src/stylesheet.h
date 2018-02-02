// Very simple v8 wrapper for xslt stylesheet, see "Wrapping C++ objects" section here http://nodejs.org/api/addons.html

#ifndef SRC_STYLESHEET_H_
#define SRC_STYLESHEET_H_

#include <libxslt/xslt.h>
#include <libxslt/transform.h>
#include <libxslt/xsltutils.h>
#include <libexslt/exslt.h>

class Stylesheet : public Nan::ObjectWrap {
	public:
	    static void Init(v8::Handle<v8::Object> exports);
	    static v8::Local<v8::Object> New(xsltStylesheetPtr stylesheetPtr);
	    static NAN_METHOD(TransformSync);
	    xsltStylesheetPtr stylesheet_obj;

	private:
	    explicit Stylesheet(xsltStylesheetPtr stylesheetPtr);
	    ~Stylesheet();
	    static Nan::Persistent<v8::Function> constructor;
};

#endif  // SRC_STYLESHEET_H_