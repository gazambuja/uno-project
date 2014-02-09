
function goToMain(){

	$("#page_map").removeClass("hide");
	$("#page_login").addClass("hide");

    console.log("Iniciando app...");
    app.initialize();
}

function goToLogin(){

	$("#page_login").removeClass("hide");
	$("#page_map").addClass("hide");
}