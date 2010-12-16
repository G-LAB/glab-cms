<?php header('Content-Type: text/plain');?>
<?='<?xml version="1.0" encoding="utf-8" ?>'?>

<cu3er>
	<settings>
		
    	<prev_button>
			<defaults round_corners="5,5,5,5"/>
			<tweenOver tint="0xFFFFFF" scaleX="1.1" scaleY="1.1"/>
			<tweenOut tint="0x000000" />
		</prev_button>
		
    	<prev_symbol>
			<tweenOver tint="0x000000" />			
		</prev_symbol>
		
    	<next_button>
			<defaults round_corners="5,5,5,5"/>			
			<tweenOver tint="0xFFFFFF"  scaleX="1.1" scaleY="1.1"/>
			<tweenOut tint="0x000000" />
		</next_button>
		
    	<next_symbol>
			<tweenOver tint="0x000000" />
		</next_symbol>	
		
		<auto_play>
			<defaults symbol="circular" time="7" />
			<tweenIn x="940" y="20" width="30" height="30" tint="0x000000" />
		</auto_play>
		
		<general 
		    slide_panel_width="725" 
		    slide_panel_height="200" 
		    slide_panel_horizontal_align="center" 
		    slide_panel_vertical_align="center" 
			  ui_visibility_time="2"
		/>
		
	</settings>    

	<slides>
<?php foreach($charts as $chart):?>
	        <slide>
	            <url><?=$chart?></url>
	        </slide>
<?php endforeach;?>
	</slides>
</cu3er>

