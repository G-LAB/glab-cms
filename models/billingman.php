<?php

class Billingman extends CI_Model {
	
	function __construct () {
		parent::__construct();
		$this->load->model('accounting');
	}
	
	function getInvoices() {
	    $this->db->select("*, (subtotal + tax) as total, (SELECT COUNT(*) FROM billing_invoices_items WHERE ivid = billing_invoices.ivid) as countItems",FALSE);
	    $query = $this->db->get('billing_invoices');
	    return $query->result_array();
	}
	
	function getInvoice($ivid) {
	    $this->db->select('*, (subtotal + tax) as total',FALSE);
	    $query = $this->db->get_where('billing_invoices',array('ivid' => $ivid),1);
	    return $query->row_array();
	}
	
	function getInvoiceItems($ivid) {
	    $invoice = $this->getInvoice($ivid);
	    $items_order = $this->getOrderItems($invoice['orid']);
	    $items_invoice = null;
	    
	    foreach ($this->getInvoiceIvimids($ivid) as $ivimid=>$orimid) $items_invoice[$ivimid] = element($orimid,$items_order);
	    
	    return $items_invoice;
	}
	
	function getInvoiceIvimids ($ivid) {
		
		$this->load->helper('array');
		
		$this->db->select('ivimid, orimid');
		$q = $this->db->get_where('billing_invoices_items','ivid = '.$ivid);
		return array_flatten($q->result_array(),'ivimid','orimid');
	}
	
	function getInvoicePayments($ivid) {
		$this->db->join('billing_payaccts a','a.pactid = p.pactid');
		$this->db->join('billing_paygateway g','g.pgid = a.pgid');
		$query = $this->db->get_where('billing_payments p',array('p.ivid' => $ivid));
		return $query->result_array();
	}
	
    function getProducts() {
        $this->db->order_by('s.sku','DESC');
        $this->db->join('(SELECT * FROM billing_products_versions ORDER BY skuvid DESC) v','s.sku=v.sku','left',FALSE);
        $this->db->group_by('s.sku');
        $query = $this->db->get('billing_products_skus s');
        return $query->result_array();
    }
    
	function getProduct($sku) {
		$this->db->order_by('s.sku','DESC');
		$this->db->join('(SELECT * FROM billing_products_versions ORDER BY skuvid DESC) v','s.sku=v.sku','left',FALSE);
		$this->db->group_by('s.sku');
		$this->db->where('s.sku',$sku);
		$query = $this->db->get('billing_products_skus s');
		return $query->row_array();
	}
    
    function getOrders() {
        $query = $this->db->get('billing_orders');
        return $query->result_array();
    }
    
    function getOrder($orid) {
        $query = $this->db->get_where('billing_orders o',array('orid' => $orid),1);
        return $query->row_array();
    }
    
    function getOrderSubtotal ($orid) {
    	$query = "	SELECT SUM(extended) as subtotal FROM (SELECT (IFNULL(orderPrice, price)*orderQty) as extended
    				FROM (billing_orders_items i)
    				LEFT JOIN billing_invoices_items iv ON i.orimid = iv.orimid
    				LEFT JOIN billing_products_versions p ON i.skuvid = p.skuvid
    				WHERE i.orid = 10000
    				GROUP BY i.orimid) AS data
    			";
    	
    	$q = $this->db->query($query);
    	$r = $q->row_array();
    	
    	return $r['subtotal'];
    }
    
    function getOrderItems($orid) {
    	
    	$this->db->select('i.*, (IFNULL(orderPrice,price)) as currentPrice, (IFNULL(orderPrice,price)*orderQty) as extended, p.*, iv.ivid',FALSE);
    	$this->db->join('billing_invoices_items iv','i.orimid = iv.orimid','left');
    	$this->db->join('billing_products_versions p','i.skuvid = p.skuvid','left');
    	$query = $this->db->get_where('billing_orders_items i',array('orid' => $orid));
    	
    	$data = array();
    	foreach ($query->result_array() as $item) $data[element('orimid',$item)] = $item;
    	
    	return $data;
    	
    }
    
    function getSkuvidBySku($sku) {
    	$this->db->limit(1);
    	$this->db->order_by('skuvid','DESC');
    	$q = $this->db->get_where('billing_products_versions','sku = '.$sku);
    	$r = $q->row_array();
    	return $r['skuvid'];
    }
    
    function getOrderInvoices($orid) {
    	
    	$this->db->select("*, (subtotal + tax) as total, (SELECT COUNT(*) FROM billing_invoices_items WHERE ivid = billing_invoices.ivid) as countItems",FALSE);
    	$query = $this->db->get_where('billing_invoices',array('orid' => $orid));
    	return $query->result_array();
    	
    }
    
    function getTaxRate ($state) {
    	if (!$state) return FALSE;
    	
    	$this->db->select('rate');
    	$q = $this->db->get_where('billing_tax_zone',array('state'=>$state),1);
    	$r = $q->row_array();
    	return $r['rate'];
    }
    
    function getTaxMultiplier ($state) {
    	return $this->getTaxRate($state)*.01;
    }
    
	function updateProductStatus($sku, $status) {
		$id = ltrim($sku, 0);
		
		$this->db->where('sku', $id);
		$data['status'] = $status;
		return $this->db->update('billing_products', $data);
	}
	
	private function updateInvoice ($ivid) {
		$invoice = $this->getInvoice($ivid);
		$order = $this->getOrder($invoice['orid']);
		$addr = $this->entity->getAddress($order['addrid']);
		$taxMult = $this->getTaxMultiplier($addr['state']);
		
		$subtotal = 0;
		$tax = 0;
		
		foreach ($this->getInvoiceItems($ivid) as $item) {
			$subtotal = $subtotal+$item['extended'];
			if ($item['isTaxable']) $tax = $tax+($item['extended']*$taxMult);
		}
		
		$data = array (
			'subtotal' => $subtotal,
			'tax' => $tax
		);
		
		$this->db->update('billing_invoices',$data,'ivid = '.$ivid);
	}
	
	function updateOrderAddress ($orid,$addrid) {
		$this->db->set('addrid',$addrid);
		$this->db->where('orid',$orid);
		$this->db->update('billing_orders');
	}
	
	function updateOrderStatus ($orid,$status) {
		$this->db->set('status',$status);
		$this->db->where('orid',$orid);
		$this->db->update('billing_orders');
	}
	
	function addOrder ($eid) {
		
		$data['eid'] = $eid;
		$data['eidCreated'] = $this->entity->getEID();
		
		$this->db->insert('billing_orders',$data);
		return $this->db->insert_id();
	}
	
	function addOrderItem ($orid,$sku) {
		$skuvid = $this->getSkuvidBySku($sku);
		if ($skuvid) $this->db->insert('billing_orders_items',array('orid'=>$orid,'skuvid'=>$skuvid));
	}
	
	function addOrderInvoice ($orid) {
		$items_all = $this->getOrderItems($orid);
		
		// Process Items Never Invoiced
		$items_invoice = null;
		foreach ($items_all as $orimid=>$item) if (!$item['ivid']) $items_invoice[] = $orimid;
		
		if (count($items_invoice)) {
			$this->db->trans_start();
			$ivid = $this->addInvoice($orid);
			if ($ivid) {
				foreach ($items_invoice as $orimid) {
					$ivimid = $this->addInvoiceItem($ivid,$orimid);
					$item = $items_all[$orimid];
					if ($ivimid) {
						// Revenue
						if ($item['extended'] != 0) $this->accounting->addLedgerEntry($item['extended'],3,$item['revenueAcid'],null,$ivimid);
						
						// Expense
						if ($item['cost'] != 0) $this->accounting->addLedgerEntry($item['cost']*$item['orderQty'],$item['costAcidDr'],$item['costAcidCr'],null,$ivimid);
					}
				}
				$this->updateInvoice($ivid);
				$this->updateOrderStatus($orid,4);
			}
			$this->db->trans_complete();
		}
	}
	
	private function addInvoice ($orid) {
		$invoice = array (
			'orid' => $orid,
			'eidCreated' => $this->entity->getEID()
		);
		$this->db->insert('billing_invoices',$invoice);
		return $this->db->insert_id();
	}
	
	private function addInvoiceItem ($ivid,$orimid) {
		$item = array (
			'ivid' => $ivid,
			'orimid' => $orimid
		);
		$this->db->insert('billing_invoices_items',$item);
		return $this->db->insert_id();
	}
	
	function addProduct($data) {
		$this->db->insert('billing_products', $data);
		return $this->db->insert_id();
	}
	
	function updateOrderItem ($orimid,$orderQty=null,$orderPrice=null) {
		
		if (is_null($orderQty) && is_null($orderPrice)) return TRUE;
		
		$data = array();
		
		if ($orderQty) $this->db->set('orderQty',$orderQty);
		
		if ($orderPrice) $this->db->set('orderPrice',$orderPrice);
		if ($orderPrice === FALSE) $this->db->set('orderPrice',null);
		
		$this->db->where('orimid',$orimid);
		$this->db->update('billing_orders_items');
	}
	
	function voidOrderItems ($data=array()) {
		
		if (!is_array($data)) $data = array($data);
		
		foreach ($data as $item) $this->db->or_where("orimid","$item");
		
		$this->db->delete('billing_orders_items');
	}
	
	function searchProducts ($str) {
		
		$this->db->or_like('name',$str);
		$this->db->or_like('sku',$str);
		
		$this->db->group_by('v.sku');
		$q = $this->db->get('billing_products_versions v');
		return $q->result_array();
	}
}

// End of File