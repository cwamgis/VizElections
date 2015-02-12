<?php
	header('Content-Type: text/html; charset=utf-8');
	$connect = new MongoClient();
	
	// select a database
	$db = $connect->electionsdb;
	$collection = $db->electionsFinalesResultats;
	// recuperation de la liste des scrutins
	$tab = $collection->distinct("libelleScrutin");
	
	$output = "";

	foreach ($tab as $cle=>$valeur)
	{
		$output .= "<option value=\"".$valeur."\">".$valeur."</option>\n";
	}
	
	echo $output;
	

?>
