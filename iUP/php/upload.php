<?php

$i = 0;

$type = $_POST["type"];

$path = dirname(__FILE__);

$pre = ($type == "file" ? "file" : "imgBase64Src");

$i = 1;

if( $type == "file" ){

	while( $file = $_FILES[$pre."_".$i] ){

		move_uploaded_file($file["tmp_name"],$path."/".$file["name"]);

		$i++;

	}
	echo "end";
	return false;
} else {
	while( $file = $_POST[$pre."_".$i] ){
		echo $file;
	}
}

?>