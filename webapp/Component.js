jQuery.sap.declare("hcm.fab.mytimeevents.HCMFAB_TIME_EVTExtension.Component");

// use the load function for getting the optimized preload file if present
sap.ui.component.load({
	name: "hcm.fab.mytimeevents",
	// Use the below URL to run the extended application when SAP-delivered application is deployed on SAPUI5 ABAP Repository
	url: "/sap/bc/ui5_ui5/sap/HCMFAB_TIME_EVT"
		// we use a URL relative to our own component
		// extension application is deployed with customer namespace
});

this.hcm.fab.mytimeevents.Component.extend("hcm.fab.mytimeevents.HCMFAB_TIME_EVTExtension.Component", {
	metadata: {
		manifest: "json"
	}
});