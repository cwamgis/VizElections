<?php
	$connect = new MongoClient();
	
	// select a database
	$db = $connect->electionsdb;
	$collection = $db->electionsFinales;
	// selection des resultats pour le scrutin et l arrondissement
	$tab = $collection->find(array("libelleScrutin"=>$_GET["scrutin"]),array("insee","nbInscrits","nbExprimes"));

	// Contruction du JSON : parcours de chaque candidat
	$output = "{";
	$cmp = 0;
	foreach ($tab as $doc)
	{
		if ($cmp!=0)$output .= ",";
		
		$output .= "\"".$cmp."\":{";
		$cmp2=0;
		foreach ($doc as $cle=> $valeur)
		{
			if ($cmp2!=0)$output .= ",";
			$output .= "\"".$cle."\":\"".$valeur."\"";			
			$cmp2++;
		}
		$output .= "}";
		$cmp++;
	}
	
	echo $output."}";
?>


