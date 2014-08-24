<?php
	include 'ChromePhp.php';
	//ChromePhp::log('hello world');
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
	//$data = null;
	//extract($_POST);
	//ChromePhp::log($_POST);
	//ChromePhp::log($request_method);
	switch ($request_method) {
    	case 'post':
    		define('SITE_ROOT',realpath('../'));
    		$feis_name = $_POST['feis_name'];
			$image_name = pathinfo($_FILES['image']['name']);
			$image_prefix = $_POST['image_prefix'];
			$type = $_POST['type'];
			$ext = $image_name['extension'];
			$newname = $feis_name.$image_prefix.".".$ext;
			$path = SITE_ROOT."/img/feis_photos/";
			$target = $path.$newname;
			$result = move_uploaded_file($_FILES['image']['tmp_name'], $target);
			$query = "INSERT INTO photos VALUES ('".$_POST['feis_id']."','".$newname."',0,'".$type."')";

			mysqli_query($link, $query);
			mysqli_close($link);
			echo $result;
    		break;
    	case 'put':
    		break;
    	case 'get':
    		ChromePhp::log($_GET);
			$id = &$_GET['id'];
			$type = &$_GET['type'];
			$query = "SELECT photo_id as id, name FROM photos where feis_id = '".$id."' and type='".$type."'";
			$result = mysqli_query($link, $query);

			if (mysqli_num_rows($result)!=0) {
				ChromePhp::log('woot');
				while($row = mysqli_fetch_assoc($result)) {
					$photos[] = $row;
				}
				echo json_encode($photos);
			}
			else {
				ChromePhp::log('bah');
				$feis[0] = '0';
				echo json_encode($photos);
			}
			mysqli_query($link, $query);
			mysqli_close($link);
    		break;
	}
?>