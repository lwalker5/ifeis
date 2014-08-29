<?php
	//include 'ChromePhp.php';

	$username = "root";
	$password = "#Planxty69";
	$hostname = "localhost";
	$dbname = "ifeis";


	$link = mysqli_connect($hostname, $username, $password, $dbname);

	if (mysqli_connect_errno()) {
		die("Unable to connect!");
	}

	$request_method = strtolower($_SERVER['REQUEST_METHOD']);
	$data = null;
	$data = json_decode(file_get_contents('php://input'));
	switch ($request_method) {
    	case 'post':
    	 	$name = $data->name;
    	 	$month = ((int)$data->month < 10 ? "0".$data->month : $data->month);
    	 	$day = ((int)$data->day < 10 ? "0".$data->day : $data->day);
				$date = $data->year."-".$month."-".$day;
				$region = $data->region;
				$place = $data->place;
				$competitors = $data->competitors;
				$dancerid = $data->dancerid;
				$feis_query = "INSERT INTO feis VALUES ('".$name."',0,'".$date."','".$region."',null,null, '".$dancerid."',null)";
	    	break;
    	case 'put':
    		$place = $data->place;
    		$competitors = $data->competitors;
    		$placement = $data->placementbool; 
    		$resultcode = $data->resultcode;
    		$feis_id = $data->id;
    		$dancer_id = $data->dancerid;
    		$feis_query = "UPDATE feis 
	    				   SET place = ".$place.", 
	    					   competitors = ".$competitors.",
	    					   placement = ".$placement." 
	    				   WHERE feis_id = ".$feis_id."";
			$dancer_query = "UPDATE dancer 
				  			 SET placements = placements + ".$resultcode[0].",
				  			 		 firsts = firsts + ".$resultcode[1].",
				  			 		 seconds = seconds + ".$resultcode[2].",
				  			 		 thirds = thirds + ".$resultcode[3]."
				 		     WHERE dancer_id = ".$dancer_id."";
			mysqli_query($link, $dancer_query);
    		break;
	}

	mysqli_query($link, $feis_query);
	mysqli_close($link);
	echo json_encode($data);
?>