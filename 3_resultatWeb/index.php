<!doctype html>
<html lang="fr">
  <head>
	<meta charset="UTF-8">
    <link rel="stylesheet" href="./css/ol.css" type="text/css">
    <link rel="stylesheet" href="./css/marc.css" type="text/css">
    <style>

    </style>
    <script src="./js/ol.js" type="text/javascript"></script>
    <script src="./js/jquery-1.10.2.min.js" type="text/javascript"></script>
    
    <title>Projet MARC</title>
  </head>
  <body OnLoad="initMapEtLegende();iniTabCoulCamembert()">
    
    <div id="container">
		<div id="map" class="map"></div>
		<div id="panneauDroite">
			<div id="menu">
				<ul>
					<li id="abs"><a href="#" >Abstention</a></li>
					<li class="menuPasSelectionne" id="res"><a href="#">Résultats</a></li>
				</ul>
			</div>
			<div id="legende" class="legende">
				<h1>Taux d'abstention électoral de la population parisienne en fonction du revenu médian</h1>
				Scrutin : 
				<select id="idElectionAbstention">
					<?php
						include("listeElections.php");
					?>
				</select>
				<h2>Abstention par arrondissement</h2>
				<canvas id="classesPoly"></canvas>
				<div class="source">Source : ville de Paris, résultats des élections 2007 à 2014</div>
				<h2>Revenu médian par unité de consommation par arrondissement</h2>
				<canvas id="stylePoint"></canvas>
				<div class="source">Source : INSEE 2009, DGFIP, revenus fiscaux localisés des ménages</div>
			</div>
			<div id="resultats" class="resultats">
				Scrutin : 
				<select id="idElectionRes">
					<?php
						include("listeElections.php");
					?>
				</select>
				<div id="labelArrondissement"></div>
				<canvas id="graphResElection"></canvas>
				<div id="listeCandidats">
					
				</div>
			</div>
		</div>
	</div>
    <script src="./js/electionsMap.js" type="text/javascript" ></script>
    <script src="./js/electionsMenuEtResultats.js" type="text/javascript" ></script>
  </body>
</html>
