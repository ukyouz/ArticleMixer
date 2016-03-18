var available_site = {
/*
	'mobile01': {
		regex: '^http:\\/\\/www.mobile01.com\\/topicdetail.php',
		title: '.topic',
		author: 'a[title="資深會員"]',
		contents: '.single-post-content',
		date: '.date',
	},
*/
	'udndata': {
		regex: '^http:\/\/udndata.com\/ndapp\/Story2007',
		title: '.story_title, .story_sub_title',
		author: '.story_author',
		contents: '.story',
		date: '.story'
	}
}

localStorage.ESsay = JSON.stringify(available_site);

var regex_id = null;
chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
	chrome.contextMenus.update("1", {enabled: false});
	if(request.href){
		regex_id = null;
		for(var name in available_site){
			var match = request.href.match(new RegExp(available_site[name].regex));
			if (match) {
				chrome.contextMenus.update("1", {enabled: true});
				// console.log(rows[i].id);
				regex_id = name;
				break;
			}
		}
	}
});

chrome.contextMenus.create({
	id: "1",
	enabled: false,
	title: chrome.i18n.getMessage("chrome_context_menu"),
	contexts: ["all"],
	onclick: function(info, tab){
		var site = JSON.parse(localStorage.ESsay)[regex_id];
		chrome.tabs.sendMessage(tab.id, {message: "getDocument", site: site}, function(response) {
	    	// console.log(response.published_at);
	    	if(response.error){
		    	chrome.notifications.create("2", {
					type: "basic",
					title: chrome.i18n.getMessage("meta_extension_name"),
					message: chrome.i18n.getMessage("notifications_save_error")+"\n"+response.error,
					iconUrl: chrome.i18n.getMessage("notifications_icon_url"),
				});
				return;
	    	}
	    	db_a.new({
		    	title: response.title,
		    	author: response.author,
		    	content: response.content,
		    	regex_id: regex_id,
		    	published_at: response.published_at,
		    	added_on: Date()
	    	}, function(){
	    		chrome.notifications.create("2", {
					type: "basic",
					title: chrome.i18n.getMessage("meta_extension_name"),
					message: chrome.i18n.getMessage("notifications_save_success")+"\n"+response.title,
					iconUrl: chrome.i18n.getMessage("notifications_icon_url"),
				});
				setTimeout(function(){
					chrome.notifications.clear("2");
				}, 1000);
	    	});
  	  });
	}
});
