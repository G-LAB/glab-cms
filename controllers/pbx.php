<?php

class Pbx extends CI_Controller 
{	
	function call () 
	{
		$this->load->library('Asterisk');

		$tel = $this->input->get_post('tel');
		
		if (strlen($tel) > 3) $tel = tel_dialstring($tel);

		if ($this->input->get_post('ext') !== false)
		{
			$ext = $this->input->get_post('ext');
		}
		elseif (isset($this->profile->current()->meta->pbx_callback) === true)
		{
			$ext = $this->profile->current()->meta->pbx_callback;
		}
		elseif (isset($this->profile->current()->meta->pbx_ext) === true)
		{
			$ext = $this->profile->current()->meta->pbx_ext;
		}
		else
		{
			show_error('No callback number or extension set in preferences.');
		}
		
		$this->asterisk->call($tel,$ext);
	}	
}

?>