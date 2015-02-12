// Gestion de l'affichage des résultats

// Tableau de couleurs utilise pour le camembert
var couleursCamembert = [];


// Fonction d'initialisation des couleurs du camembert de maniere aleatoire
function iniTabCoulCamembert()
{
	for(i=0;i<20;i++)
	{
			r=Math.floor(255*Math.random());
			v=Math.floor(255*Math.random());
			b=Math.floor(255*Math.random());
			couleursCamembert.push("rgba("+r+","+v+","+b+",1)");
	}
}

// Callback de gestion de clic menu
function clicMenu(event)
{
	// En fonction de l'onglet cliqué
	if (event.data.id == "res")
	{
		montreResultats();
	}
	else
	{
		// changement de couleur du menu
		$("#abs").removeClass("menuPasSelectionne");
		$("#res").addClass("menuPasSelectionne");
		
		$('#resultats').css('visibility', 'hidden');
		$("#legende").show();
	}
}

$("#menu ul li").each(function(){
		$(this).bind("click",{id:$(this).attr("id")},clicMenu);
	});

// Affiche le div resultats
function montreResultats()
{
	// changement de couleur du menu
	$("#res").removeClass("menuPasSelectionne");
	$("#abs").addClass("menuPasSelectionne");
	
	$("#legende").hide();
	console.log($("#resultats").html());
	$('#resultats').css('visibility', 'visible');
}

// Callback appele lors d un clic arrondissement
function clicArrondissement(idArrondissement)
{
$.ajax({
          url      : "resultats.php",
          // Passage des données au fichier php : idArrondissement et scrutin selectionne
          data     : {idArr: idArrondissement,scrutin:$("#idElectionRes").val()},
          cache    : false,
          dataType : "json",
          error    : function(request, error) { // Info Debuggage si erreur        
                       alert("Erreur resultats elections : responseText: "+request.responseText);
                     },
          success  : function(data) { 
						// On affiche le div des resultats
						montreResultats();
						// On met à jour le label d'arrondissement
						$("#labelArrondissement").html("<h2> "+(idArrondissement-75100)+"e arrondissement</h2>");
						// On vide la liste des candidats
						$("#listeCandidats").empty();
						///////////////////////////Camembert////////////////////////////
						var xCentre=125;
						var yCentre = 75;
						var rayon = 60;
						
						var canvas=document.getElementById('graphResElection');
						var context=canvas.getContext('2d');
						
						// On efface le camembert
						context.clearRect(0, 0, canvas.width, canvas.height);

						// Cercl exterieur
						context.beginPath();
						context.arc(xCentre,yCentre,rayon,0,Math.PI*2);
						// ligne
						context.lineWidth=2;
						context.stroke();

						angleDepart = 0.0;
						
						tauxTot=0.0;
						
						$(data).each(function(i,val){
							// Pour chaque candidat
							$.each(val,function(k,v){
								taux = parseFloat(v.nbVotes)/parseFloat(v.nbExprimes);
								tauxTot+=taux;
								pourcentage = Math.floor(taux*10000.0)/100;
								// ajout du candidat à la liste
								$("#listeCandidats").append("<div ><div id=\"coulCam"+k+"\" class=\"couleurCamembert\"></div><div>"+v.prenom+" "+v.nom+"</div><div>"+pourcentage+" %</div></div>");
								// changement de la couleur dans la liste
								$("#coulCam"+k).css("background-color",couleursCamembert[k % couleursCamembert.length]);
								
								// CAMEMBERT
								// angle en radian de la part de camembert
								anglePartCourante = angleDepart + 2*Math.PI * taux;
								
								context.fillStyle=couleursCamembert[k % couleursCamembert.length];
								context.beginPath();
								// On commence au centre
								context.moveTo(xCentre,yCentre); // ici
								console.log("angleDepart = "+angleDepart+" angle arrivée = "+anglePartCourante+ "taux" + taux+" taux tot = "+tauxTot);
								// on dessine la part de camembert
								context.arc(xCentre,yCentre,rayon,angleDepart,anglePartCourante);
								// on revient au centre
								context.lineTo(xCentre,yCentre);
								// on remplit mais sans bordure (pas de stroke)
								context.fill();
								
								// prochain angle de départ
								angleDepart = anglePartCourante;
								
								
						});
						});
						
						
                       
                     }      
     });
}
