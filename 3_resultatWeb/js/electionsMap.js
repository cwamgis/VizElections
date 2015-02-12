// Gestion de la carte OpenLayers

//////////////////// PARAMETRES et variables ///////////////////////

// Mémoire min, max et amplitude pour les calculs d'analyse thématique
var min = Infinity;
var max=-Infinity;
var ampli = 0;
// Tableau contenant les taux d'abstention par arrondissement
var tabTxAbs = new Object();
// facteur de division pour les cercles proportionnels
var facteurCercle = 2000;
// Tableau de couleurs pour l'analyse thématique : 5 classes
var tabCouleurs = ['rgba(151,223,198,0.6)','rgba(30,128,204,0.6)','rgba(77,77,255,0.6)','rgba(50,50,205,0.6)','rgba(15,5,107,0.6'];

// Arrondissements polygones
var sourceKML = new ol.source.KML({
			projection: 'EPSG:3857',
			url: './kml/abstentionPoly.kml',
			extractStyles: false
	});

var arrPoly = new ol.layer.Vector({
	source: sourceKML,
	style: (stylePoly()),
	title:'abstentionLayer'
	});
  
  
// Arrondissements centroides
var sourceKML2 = new ol.source.KML({
			projection: 'EPSG:3857',
			url: './kml/revenuMedianPoint.kml',
			extractStyles: false
	});

var arrPoint = new ol.layer.Vector({
	source: sourceKML2,
	style: (stylePoint()),
	title:'revenuLayer'
	});
  
  var map = new ol.Map({
	target: 'map',
	layers: [
	  new ol.layer.Tile({
		source: new ol.source.MapQuest({layer: 'osm'}),
		transparent: "true",
	  })
	],
	view: new ol.View({
	  center: ol.proj.transform([2.34, 48.85], 'EPSG:4326', 'EPSG:3857'),
	  zoom: 12.5
	})
  });  

//////////////////// FONCTIONS ///////////////////////

// Initialisation de la map et de la légende
function initMapEtLegende()
{
	
	// Ajout des deux couches kml à la carte
	map.addLayer(arrPoly);
	map.addLayer(arrPoint);
	
	// Initialisation du tableau de taux d'abstention par arrondissement avec recalcul des styles et de la legende
	rechargeStyleEtLegende();
	
	// Ecoute sur le changement de scrutin dans la légende d'abstention pour recalculer la map et la légende
	$("#idElectionAbstention").change(rechargeStyleEtLegende);
	
	// Ecoute sur la couche arrondissement pour afficher les resultats
	map.on("click", function(e) {
		map.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
			if (layer.o.title == "abstentionLayer")
			{
				clicArrondissement(feature.get('OBJECTID'));
			}
			
		})
	});	
}

// Initialise le tableau contenant les taxu d'abstention par arrondissement
// relance le calcul de style et de legende pour la couche poly
function rechargeStyleEtLegende()
{
		$.ajax({
          url      : "abstention.php",
          // Passage des données au fichier php : scrutin selectionne
          data     : {scrutin:$("#idElectionAbstention").val()},
          cache    : false,
          dataType : "json",
          error    : function(request, error) { // Info Debuggage si erreur        
                       alert("Erreur recuperation taux d abstention : responseText: "+request.responseText);
                     },
          success  : function(data) {
				min = Infinity, max=-Infinity;
				tabTxAbs = new Object();
				$(data).each(function(i,val){
							// Pour chaque arrondissement
							$.each(val,function(k,v){
								var txAbs = 100-(100*v.nbExprimes/v.nbInscrits);
								// calcul min / max / ampli
								if (txAbs<min)min = txAbs;
								if (txAbs>max)max = txAbs;
								ampli = max-min;
								// Sauvegarde du taux dans le tableau
								tabTxAbs[parseInt(v.insee)] = txAbs;
						});
				});
				
				// On recharge le style sur la couche polygone pour qu'elle soit redessinee
				console.log("coucou");
				arrPoly.setStyle((stylePoly()));
				// Calcul de la légende
				dessineLegende();
				
		  }
		});
}

// Dessine la légende
function dessineLegende()
{			
	// Legende : polygones
	var canvas = document.getElementById("classesPoly"); 
	var contexte = canvas.getContext('2d');
	
	// Efface le canvas
	contexte.clearRect(0, 0, canvas.width, canvas.height);
	
	for (i=0;i<5;i++)
	{
		contexte.fillStyle = tabCouleurs[i];
		contexte.fillRect(30, (i)+(25*i), 50, 22);
		contexte.fillStyle = "rgba(0,0,0,1)";
		minLocal = Math.round(100*(min+i*(ampli/5)))/100;
		maxLocal = Math.round(100*(minLocal+(ampli/5)))/100;
		contexte.fillText(""+minLocal+" % - "+maxLocal+" %",100, 13+(i)+(25*i));
	}
	// pas de donnée
	contexte.fillStyle = 'rgba(0,0,0,1)';
	contexte.fillRect(30, (i)+(25*i), 50, 22);
	contexte.fillStyle = "rgba(0,0,0,1)";
	minLocal = Math.round(100*(min+i*(ampli/5)))/100;
	maxLocal = Math.round(100*(minLocal+(ampli/5)))/100;
	contexte.fillText("pas de donnée",100, 13+(i)+(25*i));
	
	// Legende : cercles proportionnels
	var canvas2 = document.getElementById("stylePoint");
	var contexte2 = canvas2.getContext('2d');
	
	// Efface le canvas
	contexte2.clearRect(0, 0, canvas.width, canvas.height);
	
	contexte2.beginPath();
	contexte2.lineWidth=1;
	rev1 = 20000,rev2=40000;
	contexte2.arc(40, 2*rev1/facteurCercle, rev1/facteurCercle, 0,2*Math.PI);
	contexte2.stroke();
	contexte2.fillStyle="rgba(244,102,27,0.8)";
	contexte2.fill();
	contexte2.closePath();
	contexte2.fillStyle = "rgba(0,0,0,1)";
	contexte2.fillText(""+rev1+" €",70, 2*rev1/facteurCercle+3);
	
	
	contexte2.beginPath();
	contexte2.arc(40, 4*rev1/facteurCercle+rev1/facteurCercle, rev2/facteurCercle, 0,2*Math.PI);
	contexte2.stroke();
	contexte2.fillStyle="rgba(244,102,27,0.8)";
	contexte2.fill();
	contexte2.closePath();
	contexte2.fillStyle = "rgba(0,0,0,1)";
	contexte2.fillText(""+rev2+" €",70, 4*rev1/facteurCercle+rev1/facteurCercle+3);
}

// Fonction de style pour les arrondissements
function stylePoly()
{
	// Styles pour les étiquettes
	var textStroke = new ol.style.Stroke({
	color: '#fff',
	width: 3
	});
	var textFill = new ol.style.Fill({
		color: '#000'
	});
	
	return function(feature, resolution)
	{
			// identifiant qui nous permet d'aller chercher la couleur dans le tableau des symbologies analyse thématique
			var i=0;
			var idArr = parseInt(feature.get('OBJECTID'));
			
			// différence entre min et taux
			var diffAuMin = parseFloat(tabTxAbs[idArr]) - min;
			
			i= Math.floor(diffAuMin*5/ampli);
			if (i>4)i=4;// Cas du max
			
console.log("insee="+feature.get('OBJECTID')+" => "+tabCouleurs[i]+" i = "+i+"ampli="+ampli+"diffAuMin = "+diffAuMin);
			return [new ol.style.Style({
			fill: new ol.style.Fill({color: tabCouleurs[i]}),
			stroke: new ol.style.Stroke({color: 'black', width: 1}),
			text: new ol.style.Text({
			font: '12px Calibri,sans-serif',
			text: idArr-75100,
			fill: textFill,
			stroke: textStroke
			})
			})];	
	}
}

// Fonction de style pour les points représentant le revenu median
function stylePoint()
{
	var fill = new ol.style.Fill({
	   color: 'rgba(244,102,27,0.8)'
	 });
	 var stroke = new ol.style.Stroke({
	   color: '#111111',
	   width: 1
	 });
	return function(feature, resolution)
	{
	   return [new ol.style.Style({
		 image: new ol.style.Circle({
		   fill: fill,
		   stroke: stroke,
		   radius: feature.get("revenuMedian")/facteurCercle
		 }),
		 fill: fill,
		 stroke: stroke
	   })];
	}
}


	
       




