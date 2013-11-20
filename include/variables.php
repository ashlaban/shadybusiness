<?php

$home="/usr/local/www/";

function putBlogPosts()
{
	$files = glob( $home . "blog/posts/*.*" );
	arsort($files);

	foreach ($files as $file)
	{
		echo file_get_contents($file);
	}
}

?>