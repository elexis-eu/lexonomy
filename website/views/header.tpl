<div id="header" style="padding: 10px 14px; height: {{"73" if current=="edit" and len(doctypes)>1 else "38"}}px; border-bottom: 1px solid #1e6bcf;">
  <a href="{{rootPath}}{{dictID}}/" class="dicTitle">{{dictTitle}}</a>
  <span class="dicLinks">
    <a href="{{rootPath}}{{dictID}}/edit/" class="dicLink {{"current" if current=='edit' else ""}}>">Edit</a>
    <a href="{{rootPath}}{{dictID}}/config/" class="dicLink {{"current" if current=='config' else ""}} {{"disabled" if not user["canConfig"] else ""}}">Configure</a>
    % if current=="config" and configTitle:
        <a href="{{rootPath}}{{dictID}}/config/{{configUrl}}/" class="dicLink current mergeleft">{{configTitle}}</a>
    %end
    <a href="{{rootPath}}{{dictID}}/download/" class="dicLink {{"current" if current=='download' else ""}} {{"disabled" if not user["canDownload"] else ""}}">Download</a>
    <a href="{{rootPath}}{{dictID}}/upload/" class="dicLink {{"current" if current=='upload' else ""}} {{"disabled" if not user["canUpload"] else ""}}">Upload</a>
  </span>
  <div class="email ScreenfulUser"></div>
  %if current=="edit" and len(doctypes)>1:
    <div class="doctypes">
      %for doct in doctypes:
        <a class="doctype {{"current" if doct==doctype else ""}}" href="{{rootPath}}{{dictID}}/edit/{{doct}}/"><span class="tech"><span class="brak">&lt;</span><span class="elm">{{doct}}</span><span class="brak">&gt;</span></span></a>
      %end
    </div>
  %end
</div>
