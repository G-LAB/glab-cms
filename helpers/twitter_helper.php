<?php

	function parse_tweet($tweet) {
	    $search = array('|(http://[^ ]+)|', '/(^|[^a-z0-9_])@([a-z0-9_]+)/i', '/(^|[^a-z0-9_])#([a-z0-9_]+)/i');
	    $replace = array('<a href="$1">$1</a>', '$1<a href="http://twitter.com/$2" class="mention">@$2</a>', '$1<a href="http://search.twitter.com/search?q=#$2" class="hash">#$2</a>');
	    $tweet = preg_replace($search, $replace, $tweet);
	    
	    return $tweet;
	}