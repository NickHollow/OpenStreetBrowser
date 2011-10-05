function category_editor(id, param, cat_win) {
  // editor
  this.init=function() {
    dom_clean(this.win.content);

    if(!current_user.username) {
      dom_create_append_text(this.win.content, t("You are not logged in. You cannot save your changes."));
    }

    this.form=document.createElement("div");
    this.form.className="category_editor";
    this.win.content.appendChild(this.form);

    this.form_content=dom_create_append(this.form, "div");
    this.form_content.className="category_editor_content";

    this.view_form();

    var input=document.createElement("input");
    input.type="button";
    input.value="Save";
    input.onclick=this.save.bind(this);
    this.form.appendChild(input);

    var input=document.createElement("input");
    input.type="button";
    input.value="Cancel";
    input.onclick=this.cancel.bind(this);
    this.form.appendChild(input);

    // view select
    dom_create_append_text(this.form, "View: ");
    this.view_select=document.createElement("select");

    var opt=dom_create_append(this.view_select, "option");
    opt.value="form";
    dom_create_append_text(opt, "Form");

    var opt=dom_create_append(this.view_select, "option");
    opt.value="source";
    dom_create_append_text(opt, "Source");

    this.view_select.onchange=this.view_select_change.bind(this);
    this.form.appendChild(this.view_select);
  }

  // get_rule
  this.get_rule=function(id) {
    for(var i=0; i<this.rules.length; i++) {
      if(this.rules[i].id==id)
	return this.rules[i];
    }

    return null;
  }

  // new_rule
  this.new_rule=function() {
    var el=new category_editor_rule(this);
    this.rules.push(el);

    var div=document.createElement("div");
    this.div_rule_list.appendChild(div);
    div.className="editor_category_rule";

    el.editor(div, true);
  }

  // remove_rule
  this.remove_rule=function(rule) {
    if(!rule) {
      alert("category::remove_rule: no rule supplied");
      return null;
    }

    for(var i=0; i<this.rules.length; i++) {
      if(this.rules[i]==rule) {
        this.rules=array_remove(this.rules, i);
      }
    }

    if(rule.div)
      rule.div.parentNode.removeChild(rule.div);
  }

  // export_xml
  this.export_xml=function() {
    ret ="<category id=\""+this.id+"\" ";
    if(this.version)
      ret+="version=\""+this.version+"\"";
    ret+=">\n";

    this.tags.editor_update();
    ret+=this.tags.xml("  ");

    ret.list=[];
    for(var i=0; i<this.rules.length; i++) {
      ret+="  <rule id=\""+this.rules[i].id+"\">\n";
      this.rules[i].tags.editor_update();
      ret+=this.rules[i].tags.xml("    ");
      ret+="  </rule>\n";
    }

    ret+="</category>\n";

    return ret;
  }

  // save
  this.save=function() {
    var ret="";
   
    ret="<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
    ret+=this.export_xml();

    ajax_post("categories.php", { todo: 'save', id: this.id }, ret, this.save_callback.bind(this));
  }

  // save_callback
  this.save_callback=function(data) {
    var result=data.responseXML;
    
    var stat=result.getElementsByTagName("status");
    var stat=stat[0];

    var id=result.getElementsByTagName("id");
    if(id.length>0)
      id=id[0].textContent;
    else
      id=null;

    switch(stat.getAttribute("status")) {
      case "ok":
	var txt="";

	if(id!=this.id) {
	  txt+=sprintf("Category got a new ID '%s'\n", id);
	}

	txt+="Saved.";

	alert(txt);

	this.win.close();
	this.win=null;
	break;
      case "merge failed":
        this.resolve_conflict(stat.getAttribute("branch"), stat.getAttribute("version"));
	break;
      case "error":
	alert(t("error")+t("error:"+stat.getAttribute("error")));
        break;
      default:
	alert("Result of save: status "+stat.getAttribute("status"));
    }
  }

  // cancel
  this.cancel=function() {
    this.win.close();
    this.win=null;
  }

  // load_def
  this.load_def=function(version) {
    var param={ todo: "load" };
    param.id=this.id;

    if(version)
      param.version=version;
    if(this.param.version)
      param.version=this.param.version;

    ajax_direct("categories.php", param, this.load_def_callback.bind(this));
  }

  // read_dom
  this.read_dom=function(dom) {
    this.tags=new tags();
    this.rules=[];

    var cat_data=dom.getElementsByTagName("category");
    if(cat_data.length==0)
      return;
    cat_data=cat_data[0];

    this.tags.readDOM(cat_data);

    this.version=cat_data.getAttribute("version");

    var cur=cat_data.firstChild;
    while(cur) {
      if(cur.nodeName=="rule") {
        var t=new category_editor_rule(this, cur);
	this.rules.push(t);
      }
      cur=cur.nextSibling;
    }
  }

  // load_def_callback
  this.load_def_callback=function(response) {
    var data=response.responseXML;

    this.read_dom(data);

    this.init();
  }

  // view_form
  this.view_form=function() {
    dom_clean(this.form_content);

    var txt=document.createElement("div");
    txt.innerHTML="Tags (<a target='_new' href='http://wiki.openstreetmap.org/wiki/OpenStreetBrowser/Category_Tags#Category'>Help</a>):\n";
    this.form_content.appendChild(txt);

    var div=document.createElement("div");
    this.tags.editor(div);
    this.form_content.appendChild(div);

    var sep=document.createElement("hr");
    this.form_content.appendChild(sep);

    this.div_rule_list=document.createElement("div");
    this.div_rule_list.className="editor_category_rule_list";
    this.form_content.appendChild(this.div_rule_list);

    for(var i=0; i<this.rules.length; i++) {
      var div=document.createElement("div");
      this.div_rule_list.appendChild(div);
      div.className="editor_category_rule";

      this.rules[i].editor(div);
    }

    var input=document.createElement("input");
    input.type="button";
    input.value="New Rule";
    input.onclick=this.new_rule.bind(this);
    this.form_content.appendChild(input);
  }

  // view_source
  this.view_source=function() {
    dom_clean(this.form_content);

    this.input_source=dom_create_append(this.form_content, "textarea");
    this.input_source.className="view_source";
    this.input_source.name="xml";
    this.input_source.value=this.export_xml();
    this.input_source.onchange=this.input_source_change.bind(this);
  }

  // input_source_change
  this.input_source_change=function() {
    var dom=parse_xml(this.input_source.value);
    if(typeof dom=="string") {
      alert(dom)
      return;
    }

    this.read_dom(dom);
  }

  // view_select_change
  this.view_select_change=function() {
    switch(this.view_select.value) {
      case "form":
        this.view_form();
	break;
      case "source":
        this.view_source();
	break;
    }
  }

  // constructor
  this.id=id;
  if(!this.id)
    this.id="new";

  this.param=param;

  this.win=new tab({ class: "category_editor", title: lang("category_editor:editor", 1) });
  this.win.content.innerHTML="<img src='img/ajax_loader.gif' /> "+lang("loading");
  cat_win.tab_manager.register_tab(this.win);

  if(this.id!="new")
    this.load_def();
  else {
    this.tags=new tags(category_tags_default);
    this.rules=[];
    this.init();
  }
}

function category_editor_rule(category, dom) {
  // constructor
  this.icon=null;
  if(!dom) {
    this.id=uniqid();
    this.tags=new tags(category_rule_tags_default);
  }
  else {
    this.id=dom.getAttribute("id");
    this.tags=new tags();
    this.tags.readDOM(dom);
    if(this.tags.get("icon"))
      this.icon=icon_git.get_obj(this.tags.get("icon"));
  }
  this.data=[];
  this.category=category;

  // editor_toggle
  this.editor_toggle=function() {
    if(this.content.style.display!="none")
      this.content.style.display="none";
    else
      this.content.style.display="block";

    this.rule_title(this.header);
  }

  //remove
  this.remove=function() {
    this.category.remove_rule(this);
  }

  // rule_title
  this.rule_title=function(header) {
    while(header.firstChild) {
      header.removeChild(header.firstChild);
    }

    if(this.icon) {
      var img=dom_create_append(header, "img");
      img.src=this.icon.icon_url();
    }

    var txt;
    if(this.tags.get_lang("name", ui_lang))
      txt=this.tags.get_lang("name", ui_lang);
    else if(this.tags.get("match"))
      txt=this.tags.get("match");
    else
      txt=lang("category:new_rule");

    dom_create_append_text(header, txt);

    if((this.content)&&(this.content.style.display=="block"))
      return;

    if(this.tags.get_lang("description", ui_lang)) {
      dom_create_append(header, "br");

      dom_create_append_text(header, t("category_rule_tag:description")+": "+this.tags.get_lang("description", ui_lang));
    }

    if(this.tags.get("match")) {
      dom_create_append(header, "br");

      dom_create_append_text(header, t("category_rule_tag:match")+": "+this.tags.get("match"));
    }

    dom_create_append(header, "br");
    var input=dom_create_append(header, "input");
    input.type="button";
    input.value=lang("category_editor:expand");
  }

  this.choose_icon=function() {
    this.icon_chooser=new icon_chooser(this.tags.get("icon"), this.choose_icon_callback.bind(this));
  }

  this.choose_icon_callback=function(new_icon) {
    if(this.input) {
      this.input.value=new_icon;
      raise_event("change", this.input);
    }
  }

  this.edit_icon_finish=function(id) {
    if(this.input) {
      this.input.value=id;
      raise_event("change", this.input);
    }
  }

  this.edit_icon=function() {
    new icon_editor(this.icon, this.edit_icon_finish.bind(this));
  }

  this.editor_change_key=function(tags, tag) {
    var value=tag.val.value;

    if(tag.key.value=="icon") {
      var td=tag.val_td;
      while(td.firstChild)
	td.removeChild(td.firstChild);

      this.input=dom_create_append(td, "input");
      //this.input.type='hidden';
      this.input.value=value;
      tag.set_value_object(this.input);

      dom_create_append(td, "br");

      var input=dom_create_append(td, "input");
      input.type="button";
      input.value=lang("category_editor:choose");
      input.onclick=this.choose_icon.bind(this);

      this.preview=dom_create_append(td, "span");

      var input=dom_create_append(td, "input");
      input.type="button";
      input.value=lang("category_editor:edit");
      input.onclick=this.edit_icon.bind(this);

      tag.change(tag);
    }
    else if(tag.key.old_value=="icon") {
      var td=tag.val_td;
      while(td.firstChild)
	td.removeChild(td.firstChild);

      var input=dom_create_append(td, "input");
      input.value=value;
      tag.set_value_object(input);

      delete(this.preview);

      tag.change(tag);
    }
  }

  this.editor_change=function(tags, tag) {
    this.rule_title(this.header);

    if((tag)&&(tag.key.value=="icon")&&(this.preview)) {
      while(this.preview.firstChild)
	this.preview.removeChild(this.preview.firstChild);

      this.icon=icon_git.get_obj(tag.val.value);
      if(this.icon) {
	var img=dom_create_append(this.preview, "img");
	img.src=this.icon.icon_url();
      }
    }
  }

  // editor
  this.editor=function(div, visible) {
    if(!div) {
      alert("categories::editor: no valid div supplied");
      return;
    }

    this.div=div;


    this.header=document.createElement("div");
    this.div.appendChild(this.header);
    this.rule_title(this.header);
    this.header.onclick=this.editor_toggle.bind(this);

    this.content=document.createElement("div");
    if(!visible)
      this.content.style.display="none";
    this.div.appendChild(this.content);

    this.tags_editor=document.createElement("div");
    this.content.appendChild(this.tags_editor);

    var txt=document.createElement("div");
    txt.innerHTML="Tags (<a target='_new' href='http://wiki.openstreetmap.org/wiki/OpenStreetBrowser/Category_Tags#Rule'>Help</a>):\n";
    this.tags_editor.appendChild(txt);

    this.tags.editor_on_change_key=this.editor_change_key.bind(this);
    this.tags.editor_on_change=this.editor_change.bind(this);
    this.tags.editor(this.tags_editor);

    var input=document.createElement("input");
    input.type="button";
    input.value="Ok";
    input.onclick=this.editor_toggle.bind(this);
    this.content.appendChild(input);

    var input=document.createElement("input");
    input.type="button";
    input.value="Remove Rule";
    input.onclick=this.remove.bind(this);
    this.content.appendChild(input);
  }

  // load_entry
  this.load_entry=function(dom) {
    var id=dom.getAttribute("id");
    if(!this.data[id]) {
      this.data[id]=new category_rule_match(dom, this.category, this);
    }
    var match=this.data[id];
    var time=new Date();
    this.data[id].access=time.getTime();

    return this.data[id];
  }
}

// start_editor
function category_editor_win_show(win, category) {
  new category_editor(category.id, category.param, win);
}
  
register_hook("category_window_show", category_editor_win_show);