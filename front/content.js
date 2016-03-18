var clickedEl = null;
var topic, author, contents, date;

chrome.extension.sendMessage({href: location.href});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.message == "getDocument") {
    	// console.log(request.site);
    	var site = request.site;
    	contents = document.querySelectorAll(site.contents);
	    topic = document.querySelectorAll(site.title);
	    
	    if(contents.length==0 || topic.length==0){
			sendResponse({error: "return NULL."});
			return false;
		}
	    
    	author = document.querySelector(site.author).innerHTML;
	    date = document.querySelector(site.date).innerHTML;

	    var title = text = "";
	    for(var i=0; i<topic.length; i++){
		    title += topic[i].innerHTML;
	    }
	    title = title.replace(/^<br\/?>|<br\/?>$/gm, "");
	    for(var i=0; i<contents.length; i++){
		    text += contents[i].innerHTML;
	    }

	    var time = date.match(/((?:\d{2,4}[-/.])\d{1,2}[-/.]\d{1,2})/gm)[0];
        sendResponse({title: title, author: author, content: text, published_at: time});
    }
});
