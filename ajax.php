<?php

$url = 'https://www.artstation.com/projects.json?medium=digital2d&page=1&randomize=true';

$json = file_get_contents($url, false);

echo $json;
