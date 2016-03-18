db_a.getAll("ORDER BY added_on DESC LIMIT 5", function(result){
	var rows = result.rows;
	var articles = document.getElementById("articlesDiv");
	// console.log(rows);
	for(var i=0; i<rows.length; i++){
		var str = "<div class='article'><h3 class='title'>" + rows[i].title + "</h3>";
		str += "</div>";
		articles.innerHTML+= str;
	}
});

document.getElementById("browseBtn").addEventListener("click", function(){
	chrome.tabs.create({
		url: "/front/browse.html",
	});
});