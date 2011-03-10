<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8"/>
<title>G LAB (cms) <?=ucwords(method_clean($this->router->fetch_class()))?> : <?=ucwords(method_clean($this->router->fetch_method()))?> <?php if (isset($pageTitle)) echo ' : '.$pageTitle ?></title>

<link rel="stylesheet" type="text/css" href="https://ajax.googleapis.com/ajax/libs/yui/2.8.0r4/build/reset-fonts/reset-fonts.css"/>
<link rel="stylesheet" type="text/css" href="<?=assets_url()?>styles/jquery/jquery-ui-1.8.1.custom.css" />
<link rel="stylesheet" type="text/css" href="<?=assets_url()?>styles/global.css"/>
<link rel="stylesheet" type="text/css" href="<?=assets_url()?>styles/backend.css"/>

	
<script src="https://www.google.com/jsapi?key=ABQIAAAASLcb3i3IJ9P8CN7F3D_A9BQ5m8diZEPB9lOpxRem_4loD27uTBSVQalEdt0HpnBCTOmEd0HuJsOrpQ" type="text/javascript"></script>
<script type="text/javascript">
  // Load jQuery
  google.load("jquery", "1");
  google.load("jqueryui", "1");
</script>
<script type="text/javascript" src="<?=assets_url()?>js/jquery.bgiframe.min.js"></script>
<script type="text/javascript" src="<?=assets_url()?>js/jquery.AutoEllipsis.js"></script>
<script type="text/javascript" src="<?=assets_url()?>js/autoresize.jquery.min.js"></script>
<script type="text/javascript" src="<?=assets_url()?>js/tiny_mce/jquery.tinymce.js"></script>
<script type="text/javascript" src="<?=assets_url()?>js/jquery.qtip.min.js"></script>
<script type="text/javascript" src="<?=assets_url()?>js/jquery.placeholder.js"></script>

<?=$this->header->get()?>

<script type="text/javascript">
	// Hide Loading Message
	$(document).ready(function() {
	  $('#HUD_Loading').hide();
	  var tipTemplate = {
	     show: 'mouseover',
	     hide: 'mouseout',
	     position: { corner: { tooltip: 'topMiddle', target: 'bottomMiddle' } },
	     style: {
	       border: {
	          width: 1,
	          radius: 5,
	          color: '#c3c3c3'
	       },
	       textAlign: 'center',
	       tip: true
	     }
	  };
	  $('.tip').qtip( $.extend(true, {}, tipTemplate, {
	     // No Options, Use Content From Title Attribute
	  }));
	  $('input').placeholder();
	  $(".rtrim").addClass("nowrap").autoEllipsis();
	  $(".buttonBar").after('<span class="clear"></div>');
	  $(".buttonBar .button").addClass("ui-corner-all");
	  $('textarea.autoResize').autoResize();
	  
	  // Phone Number Click-to-Call
	  $(".phoneNumber").live('click', function () {
	  	event.preventDefault();
	  	alert(	'Your desk phone should ring shortly.\n' + 
	  			'After you answer you will be connected to ' + $(this).html() + '.' );
	  	var num = $(this).html();
	  	$.get('<?=site_url('pbx/call')?>/' + num);
	  }).qtip( $.extend(true, {}, tipTemplate, {
	     content: 'Click-to-Call',
	     position: { corner: { tooltip: 'leftMiddle', target: 'rightMiddle' } },
	  }));
	  
	  
	  $('textarea.richedit').tinymce({
  			// Location of TinyMCE script
  			script_url : '/js/tiny_mce/tiny_mce.js',
  
  			// General options
  			theme : "advanced",
  			plugins : "safari,pagebreak,style,layer,table,save,advhr,advimage,advlink,emotions,iespell,inlinepopups,insertdatetime,preview,media,searchreplace,print,contextmenu,paste,fullscreen",
  
  			// Theme options
  			theme_advanced_buttons1 : "formatselect,bold,italic,underline,strikethrough",
  			theme_advanced_buttons2 : "cut,copy,paste,pastetext,pasteword,|,search,replace,|,bullist,numlist,|,outdent,indent,blockquote,|,undo,redo,|,link,unlink,anchor,image,cleanup,help,code",
  			theme_advanced_buttons3 : "tablecontrols,|,hr,removeformat,visualaid,|,sub,sup,|,charmap,emotions,iespell,media,advhr,|,fullscreen",
  			theme_advanced_toolbar_location : "top",
  			theme_advanced_toolbar_align : "left",
  			theme_advanced_statusbar_location : "bottom",
  			theme_advanced_resizing : false,
  
  			// Example content CSS (should be your site CSS)
  			//content_css : "/styles/content.css",
  
  		});
	  
	});
	
	// Update HUD
	function updateHUD (eid) {
		event.preventDefault();
		$('html, body').animate({scrollTop:0}, 'slow'); 
		$("#HUD_Loading").fadeIn("fast",
			function () {
				$.get("<?php echo site_url("HUD/load/"); ?>/" + eid, null,
				  function(data){
				    $("#HUD").html(data);
				    $("#HUD_Loading").fadeOut("fast");
				  });
			});
	}
	
	// Toggle Menu
	function toggleMenu () {
		$("#selectMenu").toggle("blind",null,"slow");		
	}
	
	function displayMap (addr) {
		event.preventDefault();
		var addr = escape(addr);
		$("#map").html("<iframe width=\"600\" height=\"450\" frameborder=\"0\" scrolling=\"no\" marginheight=\"0\" marginwidth=\"0\" src=\"http:\/\/maps.google.com\/maps?f=q&amp;source=s_q&amp;hl=en&amp;q=" + addr + "&amp;output=embed\"><\/iframe>");
		
		$("#dialogMap").dialog({
			bgiframe: true,
			width: 620,
			height: 495,
			modal: true,
			close: function() {
				$(this).dialog('destroy');
			}
		});
		
		$(".ui-dialog").wrap('<div id="divConatiner" class="ui-style"></div>');
	}
	
	function searchHUD () {
		event.preventDefault();
		$("#cu3er-container").hide();
		$("#HUD_Loading").fadeIn("fast",
			function () {
				var searchQuery = $('#search input').val();
				$.post("<?php echo site_url("HUD/search"); ?>", { q: searchQuery },
				  function(data){
				    $("#HUD").html(data);
				    $("#HUD_Loading").fadeOut("fast");
				  });
			});
	}

	
</script>
</head>

<body class="main <?=$this->router->fetch_class()?> <?=$this->router->fetch_method()?>">

<div id="dialogMap" title="View Google Map" class="hide">
	<div id="map"></div>
</div>

<div id="hd">
	<div id="suphd">
		<h1><a href="<?php echo site_url('dashboard'); ?>" id="ScreenBug" class="tip" title="Go to Dashboard"><span>G-LAB</span></a></h1>
		<div id="tabmenu">
			<ul>
				<li><a href="#menu_clients">Clients</a></li>
				<li><a href="#menu_sales">Sales</a></li>
				<li><a href="#menu_products">Products</a></li>
				<li><a href="#menu_manage">Manage</a></li>
				<li id="tab_search">
					<a href="#menu_search" id="menu_search_trigger">Search</a>
					<span id="search"><form id="searchform" onsubmit="searchHUD()" id="globalsearch">
						<input type="search" id="searchBox" onkeyup="searchHUD()" ¬ placeholder="Global Record Search..." />
					</form></span>
				</li>
			</ul>
			<div id="menu_clients" class="ui-tabs-hide">
				<div class="menu_container">
					<div class="menu_inner">
						<div class="col">
							<h2>Make a client's day...</h2>
							<ul class="barstyle">
								<li id="bar_newclient">
									<a href="<?=site_url('profile/create')?>">
										<strong>New Client Profile</strong>
										<p>Add a new profile to the system for a person or company.</p>
									</a>
								</li>
								<li id="bar_comm">
									<a href="<?=site_url('communication')?>">
										<strong>Communication</strong>
										<p>Check the company email inbox and reply to messages.</p>
									</a>
								</li>
								<li id="bar_contacts">
									<a href="<?=site_url('contacts')?>">
										<strong>Contact Book</strong>
										<p>Look up a phone number, email address, or mailing address for a client.</p>
									</a>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
			<div id="menu_sales" class="ui-tabs-hide">
				<div class="menu_container">
					<div class="menu_inner">
						<div class="col">
							<h2>Close The Deal...</h2>
							<ul class="barstyle">
								<li id="bar_leads">
									<a href="<?=site_url('sales_tools')?>">
										<strong>Sales Toolkit</strong>
										<p>Log a new lead for the sales team or follow up on a sales lead.</p>
									</a>
								</li>
								<li id="bar_finance">
									<a href="<?=site_url('finance')?>">
										<strong>Finance &amp; Accounting</strong>
										<p>Get balances, make adjusting entries, print reports.</p>
									</a>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
			<div id="menu_products" class="ui-tabs-hide">
				<div class="menu_container">
					<div class="menu_inner">
						<div class="col">
							<h2>Make it. Trash it. Fix it.</h2>
							<ul class="barstyle">
								<li id="bar_hosting">
									<a href="<?=site_url('products/web_hosting')?>">
										<strong>Web Hosting</strong>
										<p>Manage and support clients' hosting accounts and domain names.</p>
									</a>
								</li>
								<li id="bar_cortex">
									<a href="<?=site_url('products/cortex')?>">
										<strong>Cortex</strong>
										<p>Create, suspend, cancel and troubleshoot subscriptions.</p>
									</a>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
			<div id="menu_manage" class="ui-tabs-hide">
				<div class="menu_container">
					<div class="menu_inner">
						<div class="col">
							<h2>Call it Mission Control, if you will...</h2>
							<ul class="barstyle">
								<li id="bar_brands">
									<a href="<?=site_url('brands')?>">
										<strong>Brand Manager</strong>
										<p>Adjust brand settings and marketing materials.</p>
									</a>
								</li>
								<li id="bar_agreements">
									<a href="<?=site_url('agreements')?>">
										<strong>Agreement Manager</strong>
										<p>View and update agreements and contracts.</p>
									</a>
								</li>
								<li id="bar_version_control">
									<a href="<?=site_url('version_control')?>">
										<strong>Version Control</strong>
										<p>View trees, commits, and download code.</p>
									</a>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
			<div id="menu_search"></div>
		</div>
		<script type="text/javascript">
			$(document).ready(function() {
			  $("#tabmenu").tabs( { collapsible: true, selected: -1 } );
			  
			  $("#menu_search_trigger").click( function () {
			  	$(this).parent().removeClass('ui-state-disabled');
			  	$(this).parent().addClass('ui-state-active-search');
			  	$("#tabmenu").tabs( "select" , -1 );
			  	event.preventDefault();
			  	//alert('search');
			  });
			});
		</script>
	</div>
	<div id="subhd">
		<?php echo $this->load->view('_HUD', $HUD=null); ?>
		<div id="HUD_Loading">
			<div id="progress">
				Loading...
				<img src="<?=assets_url()?>images/global/progressbar.gif"/>
			</div>
		</div>
	</div>
</div>
<div id="user">
	<?php $this->load->view('_userhud'); ?>
</div>
<div id="bd" class="fancy_corners">
	<div id="bd-inner">
		<h2><?=ucwords(method_clean($this->router->fetch_class()))?></h2>
		<div id="crumbtrail">
			<a href="<?=site_url()?>" title="Go to Dashboard" class="tip">&nbsp;<span>Home</span></a>
			<a href="<?=controller_url()?>"><?=ucwords(method_clean($this->router->fetch_class()))?></a>
			<?php if($this->router->fetch_method() != 'index'): ?>
			<a href="<?=controller_url().'/'.$this->router->fetch_method()?>"><?=ucwords(method_clean($this->router->fetch_method()))?></a>
			<?php endif; if (isset($content['nav']['title'])) : ?>
			<a href="<?php if (isset($content['nav']['uri'])) echo site_url($content['nav']['uri']); else echo current_url()?>"><?=$content['nav']['title']?></a>
			<?php endif; ?>
		</div>
		<div id="target"><?php echo $content['body'] ?></div>
	</div>
	<div id="bd-side">
		<?php echo $content['side'] ?>
	</div>
	<div class="clear"></div>
</div>
<div id="ft">
<?php $this->load->view('_footer'); ?>
</div>
</body>
</html>