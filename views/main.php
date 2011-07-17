<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8"/>
<title>G LAB (cms) :: <?=ucwords(method_clean($this->router->fetch_class()))?> : <?=ucwords(method_clean($this->router->fetch_method()))?> <?php if (isset($pageTitle)) echo ' : '.$pageTitle ?></title>

<link rel="stylesheet" type="text/css" href="https://ajax.googleapis.com/ajax/libs/yui/2.8.0r4/build/reset-fonts/reset-fonts.css"/>
<link rel="stylesheet" type="text/css" href="<?=assets_url('styles/jquery/jquery-ui-1.8.1.custom.css')?>" />
<link rel="stylesheet" type="text/css" href="<?=assets_url('js/jquery.qtip2.min.css')?>"/>
<link rel="stylesheet" type="text/css" href="<?=assets_url('styles/global.css')?>"/>
<link rel="stylesheet" type="text/css" href="<?=assets_url('styles/backend.css')?>"/>

<link rel="shortcut icon" type="image/x-icon" href="<?=assets_url('images/logos/favicon.ico')?>" />
<link rel="icon" type="image/x-icon" href="<?=assets_url('images/logos/favicon.ico')?>" />
	
<script src="https://www.google.com/jsapi?key=ABQIAAAASLcb3i3IJ9P8CN7F3D_A9BQ5m8diZEPB9lOpxRem_4loD27uTBSVQalEdt0HpnBCTOmEd0HuJsOrpQ" type="text/javascript"></script>
<script type="text/javascript">
  // Load jQuery
  google.load("jquery", "1");
  
  // Set Variables Needed Later
  var site_url = '<?=site_url()?>';
  var assets_url = '<?=assets_url()?>';
</script>
<script type="text/javascript" src="<?=assets_url('js/jquery-ui-1.8.13.custom.min.js')?>"></script>
<script type="text/javascript" src="<?=assets_url('js/jquery.bgiframe.min.js')?>"></script>
<script type="text/javascript" src="<?=assets_url('js/jquery.AutoEllipsis.js')?>"></script>
<script type="text/javascript" src="<?=assets_url('js/autoresize.jquery.min.js')?>"></script>
<script type="text/javascript" src="<?=assets_url()?>js/tiny_mce/jquery.tinymce.js"></script>
<script type="text/javascript" src="<?=assets_url('js/jquery.qtip2.pack.js')?>"></script>
<script type="text/javascript" src="<?=assets_url('js/jquery.placeholder.js')?>"></script>
<script type="text/javascript" src="<?=assets_url('js/jquery.jeditable.min.js')?>"></script>
<script type="text/javascript" src="<?=assets_url('js/backend.js')?>"></script>

<?=$this->header->get()?>

</head>

<body class="main <?=$this->router->fetch_class()?> <?=$this->router->fetch_method()?>">

<div id="hd">
	<div id="suphd">
		<h1><a href="<?=site_url('dashboard') ?>" id="ScreenBug" class="tip" title="Go to Dashboard"><span>G-LAB</span></a></h1>
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
								<li id="bar_billing">
									<a href="<?=site_url('billing')?>">
										<strong>Client Billing</strong>
										<p>Generate estimates or invoices and accept or refund payments.</p>
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
								<li id="bar_domains">
									<a href="<?=site_url('products/domain_names')?>">
										<strong>Domain Names</strong>
										<p>Manage and support domain name registrations.</p>
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
			  	setInterval(function () {
			  		$("#searchBox").focus();
			  	},1000);
			  	$(this).parent().removeClass('ui-state-disabled');
			  	$(this).parent().addClass('ui-state-active-search');
			  	$("#tabmenu").tabs( "select" , -1 );
			  	event.preventDefault();
			  });
			  
			});
		</script>
	</div>
	<div id="subhd">
		<?=$this->load->view('_HUD') ?>
		<div id="HUD_Loading">
			<div id="progress">
				Loading...
				<img src="<?=assets_url('images/global/progressbar.gif')?>"/>
			</div>
		</div>
	</div>
</div>
<div id="user">
	<?php $this->load->view('_userhud') ?>
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
			<?php endif ?>
		</div>
		<div id="target"><?=$content['body'] ?></div>
	</div>
	<div id="bd-side">
		<?=$content['side'] ?>
	</div>
	<div class="clear"></div>
</div>
<div id="ft">
<?php $this->load->view('_footer') ?>
</div>
</body>
</html>