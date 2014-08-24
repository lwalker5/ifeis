<?php
	include 'ChromePhp.php';
	ChromePhp::log('hello world');
	//echo json_encode($return);

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
	//ChromePhp::log($request_method);
	$data = json_decode(file_get_contents('php://input'));
	switch ($request_method) {
    	case 'post':
    		//ChromePhp::log($data);
    	 	$name = $data->name;
    	 	$month = ((int)$data->month < 10 ? "0".$data->month : $data->month);
    	 	$day = ((int)$data->day < 10 ? "0".$data->day : $data->day);
				$date = $data->year."-".$month."-".$day;
				//ChromePhp::log($date);
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
    		//ChromePhp::log($feis_query);
    		//ChromePhp::log($resultcode);
    			$dancer_query = "UPDATE dancer 
									  			 SET placements = placements + ".$resultcode[0].",
									  			 		 firsts = firsts + ".$resultcode[1].",
									  			 		 seconds = seconds + ".$resultcode[2].",
									  			 		 thirds = thirds + ".$resultcode[3]."
									 				 WHERE dancer_id = ".$dancer_id."";
					ChromePhp::log($dancer_query);
					mysqli_query($link, $dancer_query);
    		break;
	}

	mysqli_query($link, $feis_query);
	mysqli_close($link);
	echo json_encode($data);
?>