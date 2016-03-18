var articles = document.getElementById("articlesDiv");
var sortBySelect = document.getElementById("sortBySelect");
loadArticles("published_at", "DESC", setTinymce);
function loadArticles(orderBy, order, callback){
    var sql = "ORDER BY "+ orderBy +" "+ order;
    db_a.getAll(sql, function(result){
        var rows = result.rows;
        if(rows.length){
            articles.innerHTML = "";
            for (var i=0; i<rows.length; i++){
                var html = htmlsetter("div", rows[i][orderBy]+" "+rows[i].author, ['date']);
                html+= htmlsetter("h2", rows[i].title);
                html = htmlsetter("div", html, ['article-set-title']);
                html+= htmlsetter("div", rows[i].content, ['article-set-content', 'hidden']);
                // console.log(html);
                articles.innerHTML += htmlsetter("div", html, ['article-set']);
            };
            articles.classList.remove('loading');
            document.getElementById("total").innerHTML = rows.length;
            callback();
        }else{
            document.getElementById("navRight").classList.add('hidden');
            sortBySelect.classList.add('hidden');
        }
    });
}

function htmlsetter (tagName, innerHTML, classList) {
    var tag = document.createElement(tagName);
    if(classList!=undefined){
        for (var i=0; i<classList.length; i++)
            tag.classList.add(classList[i]);
    }
    tag.innerHTML = innerHTML;
    return tag.outerHTML;
}

function setTinymce(){
    // 設定請參閱 https://www.tinymce.com/docs/configure/
    tinymce.init({
        selector: '#articlesDiv',
        language: 'zh_TW',
        height : 'auto', menubar: false, statusbar: false, toolbar: false,
        autoresize_overflow_padding: 14, // side padding
        autoresize_bottom_margin: 0,
        autoresize_min_height: 125,
        content_style: "body{max-width:715px}",
        content_css : 'browse.css',
        plugins: 'autoresize',
        paste_as_text: true,
        readonly : 1
    });
}

document.getElementById("refreshbtn").addEventListener("click", function(){
    var order = document.getElementById("ascOrNot").checked ? " ASC" : " DESC";
    loadArticles(sortBySelect.value, order, function(){
        tinymce.activeEditor.load();
    });
})

var expandBtn = document.getElementById("expandBtn");
expandBtn.innerHTML = chrome.i18n.getMessage("browse_expand_all");
expandBtn.addEventListener("click", function(){
    var status = this.getAttribute("status");
    var sets = articles.querySelectorAll(".article-set-content");
    // console.log(tinymce.get("articlesDiv"));
    if(status=="close"){
        this.setAttribute("status", "open");
        this.innerHTML = chrome.i18n.getMessage("browse_fold_all");
        for(var i=0; i<sets.length; i++)
            sets[i].classList.remove("hidden");
        tinymce.activeEditor.load();
    }else{
        this.setAttribute("status", "close");
        this.innerHTML = chrome.i18n.getMessage("browse_expand_all");
        for(var i=0; i<sets.length; i++)
            sets[i].classList.add("hidden");
        tinymce.activeEditor.load();
    }
})

document.getElementById("delBtn").addEventListener("click", function(){
    var r = confirm("確定要清楚所有內容？此動作將無法復原。");
    if (r == true) {
        db_a.truncate();
        location.reload();
    }
});

// disable Selection on document.body
if (typeof document.body.onselectstart!="undefined")document.body.onselectstart=function(){return false} //For IE 
else if (typeof document.body.style.MozUserSelect!="undefined")document.body.style.MozUserSelect="none"; //For Firefox
else document.body.onmousedown=function(){return false} //All other route (For Opera)
document.body.style.cursor = "default";