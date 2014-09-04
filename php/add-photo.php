<?php

	$request_method = strtolower($_SERVER['REQUEST_METHOD']);

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
			echo $result;
    		break;
    	case 'put':
    		break;
    	case 'get':
			$id = &$_GET['id'];
			$type = &$_GET['type'];
			$query = "SELECT photo_id as id, name FROM photos where feis_id = '".$id."' and type='".$type."'";
    		break;
	}
?>