<img src="https://maps.google.com/maps/api/staticmap?markers=size:mid|color:red|<?=urlencode($address)?>&size=200x150&maptype=terrain&sensor=false"/>
<a href="http://maps.google.com/maps?q=<?=urlencode($address)?>" class="button">View Larger</a>
<a href="http://maps.google.com/maps?daddr=<?=urlencode($address)?>" class="button">Directions</a>