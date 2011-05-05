<?php

class Billing extends CI_Controller {
	
	function __construct () {
		
		parent::__construct();
		
		$this->load->model('billingman');
		$this->load->helper('inflector');
		
		// Console Menu
		$this->cmenu[] = array('url'=>'billing/orders', 'text'=>'Orders');
		$this->cmenu[] = array('url'=>'billing/invoices', 'text'=>'Invoices');
		$this->cmenu[] = array('url'=>'billing/products', 'text'=>'Products');
	}
	
	function index () {
		redirect('billing/orders');
	}
	
	function estimate($orid) {
		
		$order = $this->billingman->getOrder($orid);
		
		if ($order) $estimates = $this->billingman->getEstimates($orid);
		else show_error('Order not found.');
		
		$console['body'] = $this->load->view('billing/estimate_edit', array('orid'=>$orid,'estimates'=>$estimates), TRUE);
		
		$data['content']['body'] = $this->load->view('console', $console, true);
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);
	}
	
	function orders() {
		
		$this->load->helper('form');
		
		$status = $this->input->get('status');
		
		$orders = $this->billingman->getOrders($status);
	
		$console['body'] = $this->load->view('billing/orders', array('orders'=>$orders,'status'=>$status), TRUE);
		
		$data['content']['body'] = $this->load->view('console', $console, true);
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);
		
	}
	
	function order ($orid) {
		
		$this->load->library('form_validation');
		$this->load->helper('form');
		$this->header->set('js','jquery.tmpl');
		
		// Check for form submissions
		if ($this->input->post('action')) {
			if ($this->input->post('action') == 'void') $this->billingman->voidOrderItems($this->input->post('selected'));
			elseif ($this->input->post('action') == 'add') $this->billingman->addOrderItem($orid,$this->input->post('sku'));
			elseif ($this->input->post('action') == 'invoice') $this->billingman->addOrderInvoice($orid);
			elseif ($this->input->post('action') == 'updateAddress') $this->billingman->updateOrderAddress($orid,$this->input->post('addrid'));
			elseif ($this->input->post('action') == 'updateStatus') $this->billingman->updateOrderStatus($orid,$this->input->post('status'));
			elseif ($this->input->post('action') == 'update') {
				
				// Get Order Data
				$items_db = $this->billingman->getOrderItems($orid);
				$items_up = $this->input->post('update');
				
				// Set Validation Rules
				foreach ($items_db as $item) {
					$this->form_validation->set_rules('update['.$item['orimid'].'][orderPrice]', '"'.$item['name'].'" Unit Price', 'numeric');
					$this->form_validation->set_rules('update['.$item['orimid'].'][orderQty]', '"'.$item['name'].'" Quantity', 'numeric|min_value['.$item['qtyMin'].']|max_value['.$item['qtyMax'].']');
					if ($item['priceUnit'] == 'hr') $this->form_validation->set_rules('update['.$item['orimid'].'][orderQty]', '"'.$item['name'].'"', 'callback_hourly');
				}
				
				// Process Updates if Valid
				if ($this->form_validation->run()) {
					foreach ($items_up as $orimid=>$item_up) {
						$item_db = element($orimid,$items_db);
						
						// Check if Quantity Changed
						if ($item_up['orderQty'] != $item_db['orderQty']) $qty = $item_up['orderQty'];
						else $qty = null;
						
						//Check if Price Changed
						if ( 	($item_up['orderPrice'] != $item_db['price']) && 
								($item_up['orderPrice'] != $item_db['orderPrice']) ) $price = $item_up['orderPrice'];
						elseif ($item_up['orderPrice'] == $item_db['price']) $price = FALSE;
						else $price = null;
						
						$this->billingman->updateOrderItem($orimid,$qty,$price);
					}
				}
				
			}
		}
		
		$odata['orid'] = $orid;
		$odata['order'] = $this->billingman->getOrder($orid);
		$odata['items'] = $this->billingman->getOrderItems($orid);
		$odata['invoices'] = $this->billingman->getOrderInvoices($orid);
		$odata['subtotal'] = $this->billingman->getOrderSubtotal($orid);
		$odata['address'] = $this->entity->getAddress($odata['order']['addrid']);
		$odata['taxRate'] = $this->billingman->getTaxRate($odata['address']['state']);
		
		$addressOpts[0] = 'SELECT ADDRESS';
		foreach($this->entity->getAddresses($odata['order']['eid']) as $addrid=>$addr) {
			$addressOpts[$addrid] = $addr['addr1'].', ';
			if ($addr['addr2']) $addressOpts[$addrid].= $addr['addr2'].', ';
			$addressOpts[$addrid].= $addr['city'].', '.$addr['state'].' '.$addr['zip5'];
		}
		$odata['addressOpts'] = $addressOpts;
		
		$console['body'] = $this->load->view('billing/order_view', $odata, TRUE);
		
		$data['content']['body'] = $this->load->view('console', $console, true);
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);
		
	}
	
	function new_order ($eid=FALSE) {
		
		$this->load->helper('form');
		$this->header->set('js','jquery.tmpl');
		
		if (is_numeric($eid)) {
			$orid = $this->billingman->addOrder($eid);
			redirect('billing/order/'.$orid);
		}
		
		$console['body'] = $this->load->view('billing/order_new', null, TRUE);
		
		$data['content']['body'] = $this->load->view('console', $console, true);
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);
	}
	
	function print_order ($orid=false, $html=false) {
		
		$odata['orid'] = $orid;
		$odata['order'] = $this->billingman->getOrder($orid);
		$odata['items'] = $this->billingman->getOrderItems($orid);
		$odata['invoices'] = $this->billingman->getOrderInvoices($orid);
		$odata['subtotal'] = $this->billingman->getOrderSubtotal($orid);
		$odata['address'] = $this->entity->getAddress($odata['order']['addrid']);
		$odata['taxRate'] = $this->billingman->getTaxRate($odata['address']['state']);
		
		if ($html) $this->load->view('billing/order_print', $odata);
		else $this->load->pdf('billing/order_print', $odata);
		
	}
	
	function products() {
		
		$products = $this->billingman->getProducts();
	
		$console['body'] = $this->load->view('billing/products', array('data'=>$products), TRUE);
		
		$data['content']['body'] = $this->load->view('console', $console, true);
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);
		
	}
	
	function product($pdid=FALSE) {
		
		$this->load->helper('form');
		
		$product = $this->billingman->getProduct($pdid);
		
		$data['pageTitle'] = element('name',$product);
	
		$console['body'] = $this->load->view('billing/product_view', array('data'=>$product), TRUE);
		
		$data['content']['body'] = $this->load->view('console', $console, true);
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);
		
	}
	
	function invoices () {
		
		$invoices = $this->billingman->getInvoices();
	
		$console['body'] = $this->load->view('billing/invoices', array('data'=>$invoices), TRUE);
		
		$data['content']['body'] = $this->load->view('console', $console, true);
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);
	}
	
	function invoice ($ivid) {
		
		$idata['invoice'] = $this->billingman->getInvoice($ivid);
		$idata['items'] = $this->billingman->getInvoiceItems($ivid);
		$idata['payments'] = $this->billingman->getInvoicePayments($ivid);
		
		$console['body'] = $this->load->view('billing/invoice_view', $idata, TRUE);
		
		$data['content']['body'] = $this->load->view('console', $console, true);
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);
		
	}
	
	// Form Validation Functions
	function hourly ($str) {
		
		settype($str, "float");
		
		$this->form_validation->set_message('hourly', '%s must be billed in 15 minute increments.');
		
		if ( intval($str/.25) == ($str/.25) ) return TRUE;
		else return FALSE;
		
	}
	
	function ajax ($mode) {
		if ($mode == 'products') {
			echo json_encode($this->billingman->searchProducts($this->input->post('q')));
		} elseif ($mode == 'entities') {
			echo json_encode($this->entity->search($this->input->post('q')));
		}
	}
	
}

?>