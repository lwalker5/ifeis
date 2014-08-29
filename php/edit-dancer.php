<?php
	//include 'ChromePhp.php';
	//ChromePhp::log('hello world');

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
			$birthday = $data->birthday;
			$region = $data->region;
			$level = $data->level;
			$query = "INSERT INTO dancer VALUES ('".$name."','".$date."','".$region."','".$level."')";
			mysqli_query($link, $query);
    		break;
    	case 'put': 
    		$source = $data->page;
    		$dancer_id = $data->id;
    		if ($source == 'profile') {
	    	 	$name = $data->name;
				$birthday = $data->birthday;
				$region = $data->region;
				$level = $data->level;
	    		$query = "UPDATE dancer 
	    				  SET name = '".$name."', 
	    					  birthday = '".$birthday."',
	    					  region = '".$region."',
	    					  level = '".$level."'
	    				  WHERE dancer_id = ".$dancer_id."";
	    	}

	    	else if ($source == 'customize') {
	    		$color = $data->color;
	    		$background = $data->background;
	    		$query = "UPDATE dancer
	    				  SET color = '".$color."',
	    				  	  background = '".$background."'
	    				  WHERE dancer_id = ".$dancer_id."";
	    	}
			mysqli_query($link, $query);
			echo('success');
    		break;
    	case 'get': 
		    $query = "SELECT dancer_id as id, name, birthday, region, level, firsts, seconds, thirds, placements,color,background FROM dancer WHERE dancer_id = 1";

			$result = mysqli_query($link, $query);
			if (mysqli_num_rows($result)!=0) {
				while($row = mysqli_fetch_assoc($result)) {
					$feis = $row;
				}
			}
			echo json_encode($feis);
    		break;
	}

	mysqli_close($link);
?>