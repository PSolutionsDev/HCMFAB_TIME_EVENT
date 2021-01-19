jQuery.sap.require("sap.m.MessageToast");
jQuery.sap.require("hcm.fab.mytimeevents.utils.formatter");
sap.ui.define([
	"hcm/fab/mytimeevents/controller/BaseController",
	"sap/m/MessagePopover",
	"sap/m/MessagePopoverItem",
	"sap/ui/Device",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"hcm/fab/lib/common/util/CommonModelManager"
], function (B, M, g, D, J, H, C) {
	"use strict";

	function q(e) {
		var c = e.getParameter("element");
		var E = e.getParameter("message");
		if (c && c.setValueStateText && E) {
			c.setValueStateText(E);
		}
		if (c && c.setValueState) {
			c.setValueState("Error");
		}
	}

	function t(e) {
		var c = e.getParameter("element");
		if (c && c.setValueState) {
			c.setValueState("None");
		}
	}
	return sap.ui.controller("hcm.fab.mytimeevents.HCMFAB_TIME_EVTExtension.controller.OverviewCustom", {

		//    extHookCreatePostObject: null,
		//    extHookOnCreate: null,
		//    extHookOnDelete: null,
		//    extHookOnChangeOfDate: null,
		//    extHookOriginColumn: null,
		//    extHookCalendarMarking: null,
		onInit: function () {
				debugger;
				//Initialize models from Tables
				this._initEmptyModels();

				//Load dialog to create event
			//	this._loadDetEntryDialog();

				this.checkOriginColumnDisplay();
				this.busyDialog = new sap.m.BusyDialog();
				this.oRouter = this.getOwnerComponent().getRouter();
				this._nCounter = 0;
				this.oFormatYyyymmdd = sap.ui.core.format.DateFormat.getInstance({
					pattern: "yyyy-MM-dd",
					calendarType: sap.ui.core.CalendarType.Gregorian
				});
				this.timeFormatter = sap.ui.core.format.DateFormat.getTimeInstance({
					pattern: this.byId("timePicker").getDisplayFormat()
				});
				this.oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
				this.oErrorHandler = this.getOwnerComponent()._oErrorHandler;
				this.oMessageManager = this.getOwnerComponent().oMessageManager;
				this.oMessageProcessor = this.getOwnerComponent().oMessageProcessor;
				this.legend = this.byId("legend");
				this.mlegend = this.byId("mlegend");
				this.calendar = this.byId("calendar");
				this.mCalendar = this.byId("mDatePicker");
				this.lFavorite = this.byId("lFavorites");
				this.oDataModel = this.getOwnerComponent().getModel();
				this.dateValid = true;
				this.oRouter.getRoute("overview").attachMatched(this._onOverviewRouteMatched, this);
				sap.ui.getCore().getMessageManager().registerObject(this.getView(), true);
				var c = new Date();
				var a = new Date();
				this.setSelectedDate(a);
				var s;
				if (c.getMonth() % 2 == 0) {
					s = c.getMonth();
				} else {
					s = c.getMonth() - 1;
				}
				c.setMonth(s, 1);
				this.dateFrom = c;
				c = new Date();
				c.setMonth(s + 2, 0);
				this.dateTo = c;
				var b = this;
				c = new Date();
				this.selectedDate = c;
				if (this.byId("quickEntry").getVisible() === true) {
					setInterval(function () {
						try {
							var v = new J({
								dateValue: new Date()
							});
							b.getView().setModel(v, "timeEventModel");
						} catch (e) {
							jQuery.sap.log.warning("Could not set Time", ["getConfiguration"], ["hcm.myTimeEvents"]);
						}
					}, 100);
					this.setTimeIntervalDetails = setInterval(function () {
						try {
							b.byId("timePicker").setValue(b.timeFormatter.format(new Date()));
						} catch (e) {
							jQuery.sap.log.warning("Could not set Time", ["getConfiguration"], ["hcm.myTimeEvents"]);
						}
					}, 60000);
				}
				if (sap.ui.Device.system.phone === true) {
					this.byId("calendar").setVisible(false);
					this.byId("legend").setVisible(false);
					this.byId("mDatePicker").setDateValue(new Date());
					this.byId("idEventsTable").setMode("None");
				}
				var d = this.oDataModel.metadataLoaded();
				d.then(function (o) {}).catch(function (e) {});
				this.initCalendarLegend();
				sap.ui.getCore().attachParseError(q);
				sap.ui.getCore().attachValidationSuccess(t);
				this.downloadButtonVisibleInitially = this.byId("download").getVisible();
				C.getDefaultAssignment("MYTIMEEVENTS").then(function (e) {
					this.onAssignmentsLoaded(e.EmployeeId);
				}.bind(this));
				if (this.byId("quickEntry").getVisible() === false) {
					this.byId("download").setVisible(false);
					this.byId("favorite").setVisible(false);
					this.byId("save").setVisible(true);
					this.byId("cancel").setVisible(true);
				}
			},
			//    onExit: function () {
			//        sap.ui.getCore().getMessageManager().removeAllMessages();
			//        C.resetApplicationState("MYTIMEEVENTS");
			//    },
			//    handleMessagePopover: function (e) {
			//        var m = new g({
			//            type: "{message>severity}",
			//            description: "{message>description}",
			//            title: "{message>message}",
			//            subtitle: "{message>additionalText}"
			//        });
			//        var o = new M({
			//            items: {
			//                path: "message>/",
			//                template: m
			//            }
			//        });
			//        o.setModel(sap.ui.getCore().getMessageManager().getMessageModel(), "message");
			//        o.toggle(e.getSource());
			//    },
			//    handleCreateEvent: function () {
			//        this.byId("favorite").setVisible(false);
			//        this.byId("download").setVisible(false);
			//        this.byId("save").setVisible(true);
			//        this.byId("cancel").setVisible(true);
			//    },
			//    handleCalendarSelect: function (e) {
			//        if (this.extHookOnChangeOfDate) {
			//            this.extHookOnChangeOfDate();
			//        } else {
			//            var d, a;
			//            var s;
			//            if (sap.ui.Device.system.phone === true) {
			//                d = new Date(e.getSource().getDateValue());
			//                a = new Date(e.getSource().getDateValue());
			//                d.setYear(d.getFullYear());
			//                if (d.getMonth() % 2 == 0) {
			//                    s = d.getMonth();
			//                } else {
			//                    s = d.getMonth() - 1;
			//                }
			//                d.setMonth(s, 1);
			//                this.dateFrom = d;
			//                d = new Date(e.getSource().getDateValue());
			//                d.setYear(d.getFullYear());
			//                d.setMonth(s + 1, 0);
			//                this.dateTo = d;
			//            } else {
			//                d = new Date(e.getSource().getSelectedDates()[0].getStartDate());
			//                a = new Date(e.getSource().getSelectedDates()[0].getStartDate());
			//                d.setYear(d.getFullYear());
			//                if (d.getMonth() % 2 == 0) {
			//                    s = d.getMonth();
			//                } else {
			//                    s = d.getMonth() - 1;
			//                }
			//                d.setMonth(s, 1);
			//                this.dateFrom = d;
			//                d = new Date(e.getSource().getSelectedDates()[0].getStartDate());
			//                d.setYear(d.getFullYear());
			//                d.setMonth(s + 2, 0);
			//                this.dateTo = d;
			//            }
			//            this.selectedDate = a;
			//            this.setSelectedDate(this.selectedDate);
			//            this.getEvents(this.selectedDate);
			//        }
			//    },
			//    showTimeStatementDialog: function () {
			//        var a = this;
			//        var b = new Date(), y = b.getFullYear(), m = b.getMonth(), d = b.getDate(), p = this.empID;
			//        this.oStartDate = new Date(y, m, 1);
			//        this.oEndDate = new Date(y, m, d);
			//        this.fromDatePicker = new sap.m.DatePicker({
			//            dateValue: this.oStartDate,
			//            valueFormat: "yyyy-MM-dd",
			//            visible: false,
			//            change: function (E) {
			//                var h = E.getSource();
			//                var v = E.getParameter("valid");
			//                if (v) {
			//                    if (new Date(this.getValue()).getTime() > new Date(a.oEndDate).getTime()) {
			//                        h.setValueState(sap.ui.core.ValueState.Error);
			//                        a.oErrorHandler.pushError(a.oBundle.getText("invalidDates"), a.oMessageManager, a.oMessageProcessor);
			//                    } else {
			//                        a.oStartDate = this.getValue();
			//                        h.setValueState(sap.ui.core.ValueState.None);
			//                    }
			//                } else {
			//                    var i = a.oBundle.getText("dateError");
			//                    sap.m.MessageToast.show(i);
			//                    h.setValueState(sap.ui.core.ValueState.Error);
			//                }
			//            }
			//        });
			//        this.toDatePicker = new sap.m.DatePicker({
			//            dateValue: this.oEndDate,
			//            valueFormat: "yyyy-MM-dd",
			//            visible: false,
			//            change: function (E) {
			//                var h = E.getSource();
			//                var v = E.getParameter("valid");
			//                if (v) {
			//                    if (new Date(this.getValue()).getTime() < new Date(a.oStartDate).getTime()) {
			//                        h.setValueState(sap.ui.core.ValueState.Error);
			//                        a.oErrorHandler.pushError(a.oBundle.getText("invalidDates"), a.oMessageManager, a.oMessageProcessor);
			//                    } else {
			//                        h.setValueState(sap.ui.core.ValueState.None);
			//                        a.oEndDate = this.getValue();
			//                    }
			//                } else {
			//                    h.setValueState(sap.ui.core.ValueState.Error);
			//                }
			//            }
			//        });
			//        this.oDateRange = new sap.m.DateRangeSelection({
			//            dateValue: this.oStartDate,
			//            secondDateValue: this.oEndDate,
			//            change: function (E) {
			//                var h = E.getSource();
			//                var s = E.getParameter("from");
			//                var i = E.getParameter("to");
			//                var v = E.getParameter("valid");
			//                a.dateValid = v;
			//                if (v) {
			//                    if (s.getTime() < new Date(a.oStartDate).getTime()) {
			//                        h.setValueState(sap.ui.core.ValueState.None);
			//                        a.oStartDate = c.format(s);
			//                        a.oEndDate = c.format(i);
			//                    } else {
			//                        h.setValueState(sap.ui.core.ValueState.None);
			//                        a.oStartDate = c.format(s);
			//                        a.oEndDate = c.format(i);
			//                    }
			//                } else {
			//                    a.oErrorHandler.pushError(a.oBundle.getText("invalidDates"), a.oMessageManager, a.oMessageProcessor);
			//                    h.setValueState(sap.ui.core.ValueState.Error);
			//                }
			//            }
			//        });
			//        var c = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "yyyy-MM-dd" });
			//        this.oStartDate = c.format(this.fromDatePicker.getDateValue());
			//        this.oEndDate = c.format(this.toDatePicker.getDateValue());
			//        this.setAndParse = function (h, i) {
			//            a.fromDatePicker.setDateValue(h);
			//            a.toDatePicker.setDateValue(i);
			//            a.oStartDate = c.format(a.fromDatePicker.getDateValue());
			//            a.oEndDate = c.format(a.toDatePicker.getDateValue());
			//        };
			//        var f = new sap.ui.layout.form.FormContainer({
			//            visible: false,
			//            formElements: [new sap.ui.layout.form.FormElement({
			//                    label: new sap.m.Label({
			//                        text: a.oBundle.getText("dateRange"),
			//                        required: true,
			//                        visible: false
			//                    }),
			//                    fields: a.oDateRange
			//                })]
			//        });
			//        var F = new sap.ui.layout.form.FormContainer({
			//            formElements: [new sap.ui.layout.form.FormElement({
			//                    fields: [new sap.m.RadioButtonGroup({
			//                            selectedIndex: 1,
			//                            select: function (h) {
			//                                var i = h.getSource().getSelectedIndex();
			//                                switch (i) {
			//                                case 0:
			//                                    a.oStartDate = new Date(y, m, d - 7);
			//                                    a.oEndDate = new Date(y, m, d);
			//                                    a.setAndParse(a.oStartDate, a.oEndDate);
			//                                    f.setVisible(false);
			//                                    break;
			//                                case 1:
			//                                    a.oStartDate = new Date(y, m, 1);
			//                                    a.oEndDate = new Date(y, m + 1, 0);
			//                                    a.setAndParse(a.oStartDate, a.oEndDate);
			//                                    f.setVisible(false);
			//                                    break;
			//                                case 2:
			//                                    a.oStartDate = new Date(y, m, 1);
			//                                    a.oEndDate = new Date(y, m, d);
			//                                    a.setAndParse(a.oStartDate, a.oEndDate);
			//                                    f.setVisible(true);
			//                                    break;
			//                                }
			//                            },
			//                            buttons: [
			//                                new sap.m.RadioButton({
			//                                    text: a.oBundle.getText("currentWeek"),
			//                                    customData: new sap.ui.core.CustomData({
			//                                        "key": "Period",
			//                                        "value": "CURRENT_WEEK"
			//                                    })
			//                                }),
			//                                new sap.m.RadioButton({
			//                                    text: a.oBundle.getText("currentMonth"),
			//                                    customData: new sap.ui.core.CustomData({
			//                                        "key": "Period",
			//                                        "value": "CURRENT_MONTH"
			//                                    })
			//                                }),
			//                                new sap.m.RadioButton({
			//                                    text: a.oBundle.getText("otherPeriod"),
			//                                    customData: new sap.ui.core.CustomData({
			//                                        "key": "Period",
			//                                        "value": "OTHER_PERIOD"
			//                                    })
			//                                })
			//                            ]
			//                        })]
			//                })]
			//        });
			//        var o = new sap.ui.layout.form.Form({
			//            maxContainerCols: 2,
			//            layout: new sap.ui.layout.form.ResponsiveGridLayout({
			//                labelSpanL: 3,
			//                emptySpanL: 2,
			//                labelSpanM: 3,
			//                emptySpanM: 2,
			//                labelSpanS: 3,
			//                emptySpanS: 2,
			//                columnsL: 2,
			//                columnsM: 2,
			//                columnsS: 2
			//            }),
			//            formContainers: [
			//                F,
			//                f
			//            ]
			//        });
			//        var e = new sap.m.Dialog({
			//            title: a.oBundle.getText("selectTimeStatement"),
			//            content: o,
			//            buttons: [
			//                new sap.m.Button({
			//                    text: a.oBundle.getText("download"),
			//                    press: function () {
			//                        if (a.dateValid) {
			//                            this.getParent().close();
			//                            var T = "/TimeStatementSet(EmployeeID='" + p + "',Begda=datetime'" + a.oStartDate + "T00:00:00',Endda=datetime'" + a.oEndDate + "T00:00:00')/$value";
			//                            T = a.getOwnerComponent().getModel().sServiceUrl + T;
			//                            window.open(T, "_blank");
			//                        }
			//                    }
			//                }),
			//                new sap.m.Button({
			//                    text: a.oBundle.getText("cancel"),
			//                    press: function () {
			//                        this.getParent().close();
			//                    }
			//                })
			//            ]
			//        });
			//        e.open();
			//    },
			//    onApproverHelpRequest: function () {
			//        var b = this;
			//        var v = this.getView();
			//        var d = v.byId("approverDialog");
			//        var a = new sap.ui.model.Filter({
			//            path: "Name",
			//            operator: sap.ui.model.FilterOperator.EQ,
			//            value1: "*"
			//        });
			//        var f = [];
			//        f.push(a);
			//        var p = {
			//            filters: f,
			//            success: function (c) {
			//                var m = new sap.ui.model.json.JSONModel(c.results);
			//                m.setProperty("/DialogTitle", b.oBundle.getText("searchApprover"));
			//                v.setModel(m, "approver");
			//            },
			//            error: function (e) {
			//                b.processError(e);
			//            }
			//        };
			//        this.oDataModel.read("/ApproverSet", p);
			//        if (!d) {
			//            var o = {
			//                handleConfirm: function (e) {
			//                    var s = e.getParameter("selectedItem");
			//                    b.byId("approver").setValue(s.getTitle());
			//                    b.approverIdSelected = s.getDescription();
			//                },
			//                handleSearch: this.searchAction.bind(this)
			//            };
			//            d = sap.ui.xmlfragment(v.getId(), "hcm.fab.mytimeevents.view.fragments.ApproverDialog", o);
			//            v.addDependent(d);
			//        }
			//        jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), d);
			//        d.open();
			//    },
			//    searchAction: function (e) {
			//        var s = this;
			//        this.searchString = e.getParameter("value");
			//        if (e.getParameter("value").length > 0 || !isNaN(e.getParameter("value"))) {
			//            if (this.searchString.length === 0) {
			//                this.searchString = "*";
			//            }
			//            if (this.searchString.length >= 80) {
			//                this.searchString = this.searchString.substring(0, 79);
			//            }
			//            s.searchApprover(s.searchString);
			//        }
			//    },
			//    onItemPress: function (e) {
			//        var s = e.getSource("selectedItem").data().id;
			//        var a;
			//        var b = this.timeEvents;
			//        for (var i = 0; i < b.results.length; i++) {
			//            if (b.results[i].ReqId === s) {
			//                a = b.results[i];
			//                break;
			//            }
			//        }
			//        if (a.Status == "APPROVED") {
			//            a.change = false;
			//            this.oMessageManager.removeAllMessages();
			//            var m = new sap.ui.model.json.JSONModel();
			//            this.setGlobalModel(m, "exchangeModel");
			//            var c = this.byId("idTimeEventType").getModel();
			//            this.setGlobalModel(c, "eventTypesModel");
			//            m.setData(a);
			//            this.getRouter().navTo("change", {}, false);
			//        } else {
			//            this.oMessageManager.removeAllMessages();
			//            var m = new sap.ui.model.json.JSONModel();
			//            this.setGlobalModel(m, "exchangeModel");
			//            var c = this.byId("idTimeEventType").getModel();
			//            this.setGlobalModel(c, "eventTypesModel");
			//            m.setData(a);
			//            this.getRouter().navTo("change", {}, false);
			//        }
			//    },
			//    onItemSwipeNavigation: function (e) {
			//        var m = new sap.ui.model.json.JSONModel();
			//        this.setGlobalModel(m, "exchangeModel");
			//        var a = this.byId("idTimeEventType").getModel();
			//        this.setGlobalModel(a, "eventTypesModel");
			//        if (sap.ui.Device.system.phone === true) {
			//            var s = e.getSource().getParent().getParent().getSwipedItem().data().id;
			//        }
			//        var b;
			//        var c = this.timeEvents;
			//        for (var i = 0; i < c.results.length; i++) {
			//            if (c.results[i].ReqId === s) {
			//                b = c.results[i];
			//                break;
			//            }
			//        }
			//        m.setData(b);
			//        this.getRouter().navTo("change", {}, false);
			//    },
			//    onAssignmentsLoaded: function (a) {
			//        var b = this;
			//        this.byId("toolBtnCE").setAssignmentId(a);
			//        this.byId("toolBtnOB").setAssignmentId(a);
			//        this.checkCalendarMarking();
			//        this.empID = a;
			//        this.setPernr(this.empID);
			//        this.getTimeEvalMessages(this.empID);
			//        this.getBalances(this.empID);
			//        if (this.LateCalendarMarking !== "true") {
			//            new Promise(function (r, R) {
			//                b.getConfiguration();
			//                r(b.getEvents(new Date()));
			//                R();
			//            }).then(b.initCalendar(b.empID));
			//        } else {
			//            new Promise(function (r, R) {
			//                b.getConfiguration();
			//                r(b.getEvents(new Date()));
			//                R();
			//            });
			//        }
			//        this.getFavorites();
			//        this.getEventTypes(this.empID);
			//    },
			//    onAssignmentSwitch: function (e) {
			//        var a = this;
			//        var b = e.getParameter("selectedAssignment");
			//        this.byId("toolBtnCE").setAssignmentId(b);
			//        this.byId("toolBtnOB").setAssignmentId(b);
			//        this.checkCalendarMarking();
			//        this.empID = b;
			//        this.setPernr(this.empID);
			//        this.getTimeEvalMessages(this.empID);
			//        this.getBalances(this.empID);
			//        var c = new Date();
			//        var s;
			//        if (c.getMonth() % 2 == 0) {
			//            s = c.getMonth();
			//        } else {
			//            s = c.getMonth() - 1;
			//        }
			//        c.setMonth(s, 1);
			//        this.dateFrom = c;
			//        c = new Date();
			//        c.setMonth(s + 2, 0);
			//        this.dateTo = c;
			//        if (this.LateCalendarMarking !== "true") {
			//            new Promise(function (r, R) {
			//                a.getConfiguration();
			//                r(a.getEvents(new Date()));
			//                R();
			//            }).then(a.initCalendar(a.empID));
			//        } else {
			//            new Promise(function (r, R) {
			//                a.getConfiguration();
			//                r(a.getEvents(new Date()));
			//                R();
			//            });
			//        }
			//        this.getFavorites();
			//        this.getEventTypes(this.empID);
			//    },
			//    showFavoriteDialog: function () {
			//        var c = this;
			//        var b = new sap.ui.model.Filter({
			//            path: "EmployeeID",
			//            operator: sap.ui.model.FilterOperator.EQ,
			//            value1: this.empID
			//        });
			//        var f = [];
			//        f.push(b);
			//        var m = new sap.ui.model.json.JSONModel();
			//        var p = {
			//            filters: f,
			//            success: function (d, r) {
			//                var a = d;
			//                m.setData(a.results);
			//                c.hideBusy();
			//            },
			//            error: function (e) {
			//                c.processError(e);
			//            }
			//        };
			//        this.showBusy();
			//        this.oDataModel.read("/FavoritesSet", p);
			//    },
		onSelect: function (e) {
			if (e.getParameter('selectedKey') == "createEvent") {
				this.oMessageManager.removeAllMessages();
				this.byId('download').setVisible(false);
				this.byId('favorite').setVisible(false);
				this.byId('save').setVisible(true);
				this.byId('cancel').setVisible(true);

				//Hide button create
				this.byId('create').setVisible(false);

			} else if (e.getParameter('selectedKey') == "eventList") {
				this.oMessageManager.removeAllMessages();
				this.byId('save').setVisible(false);
				this.byId('cancel').setVisible(false);
				if (this.downloadButtonVisibleInitially === true) {
					this.byId('download').setVisible(true);
				}
				this.byId('favorite').setVisible(false);
				this.resetFields();
				if (this.LateCalendarMarking === "true") {
					this.LateCalendarMarking = "false";
					this.initCalendar();
				}
				//Show button create
				this.byId('create').setVisible(true);
				//Load tables event
				this._loadData();
			} else if (e.getParameter('selectedKey') == "quickEntry") {
				this.oMessageManager.removeAllMessages();
				this.byId('save').setVisible(false);
				this.byId('cancel').setVisible(false);
				if (this.downloadButtonVisibleInitially === true) {
					this.byId('download').setVisible(true);
				}
				this.byId('favorite').setVisible(true);
				this.resetFields();

				//Hide button create
				this.byId('create').setVisible(false);
			}
		},
			//    openConfirmationPopup: function (s, a, b) {
			//        var c = this;
			//        var e = [];
			//        for (var i = 0; i < s.additionalInformation.length; i++) {
			//            e.push(new sap.m.Label({
			//                text: s.additionalInformation[i].label,
			//                design: "Bold"
			//            }));
			//            e.push(new sap.m.Text({ text: s.additionalInformation[i].text }));
			//        }
			//        var f = new sap.ui.layout.form.SimpleForm({
			//            minWidth: 1024,
			//            editable: false,
			//            maxContainerCols: 2,
			//            layout: "ResponsiveGridLayout",
			//            labelSpanL: 5,
			//            labelSpanM: 5,
			//            labelSpanS: 5,
			//            emptySpanL: 2,
			//            emptySpanM: 2,
			//            emptySpanS: 2,
			//            columnsL: 1,
			//            columnsM: 1,
			//            columnsS: 1,
			//            content: e
			//        });
			//        var o = new sap.m.Dialog({
			//            title: s.title,
			//            content: [f],
			//            beginButton: new sap.m.Button({
			//                text: s.confirmButtonLabel,
			//                press: function (E) {
			//                    var k;
			//                    if (window.event) {
			//                        k = window.event.keyCode;
			//                    } else {
			//                        k = E.which;
			//                    }
			//                    if (k != 13) {
			//                        if (a === "C") {
			//                            c.createTimeEvent();
			//                        } else if (a === "F") {
			//                            c.createTimeEvent(true, b);
			//                        } else {
			//                            c._deleteEntry(b);
			//                        }
			//                        o.close();
			//                    }
			//                }
			//            }),
			//            endButton: new sap.m.Button({
			//                text: this.oBundle.getText("cancel"),
			//                press: function () {
			//                    o.close();
			//                }
			//            })
			//        }).addStyleClass("sapUiContentPadding sapUiMediumMarginTopBottom");
			//        o.open();
			//    },
			//    _deleteEntry: function (s) {
			//        var a = this;
			//        this.showBusy();
			//        var p = this.createPostObject("D", s.data());
			//        var b = "/TimeEventSet(ReqId='" + p.ReqId + "',EmployeeID='" + p.EmployeeID + "')";
			//        var P = {
			//            success: function () {
			//                a.hideBusy();
			//                var c = a.oBundle.getText("timeEventDeleted");
			//                sap.m.MessageToast.show(c, { duration: 1000 });
			//                a.getEvents(a.selectedDate);
			//            },
			//            error: function (e) {
			//                a.hideBusy();
			//                a.processError(e);
			//            }
			//        };
			//        this.oDataModel.remove(b, P);
			//    },
			//    searchApprover: function (s) {
			//        var c = this;
			//        var p = "/ApproverSet";
			//        var d = this, f = [];
			//        var e = "";
			//        if (!isNaN(s)) {
			//            e = s;
			//        }
			//        e = encodeURIComponent(e);
			//        s = encodeURIComponent(s);
			//        var a = new sap.ui.model.Filter({
			//            path: "Name",
			//            operator: sap.ui.model.FilterOperator.EQ,
			//            value1: s
			//        });
			//        var b = new sap.ui.model.Filter({
			//            path: "EmployeeID",
			//            operator: sap.ui.model.FilterOperator.EQ,
			//            value1: e
			//        });
			//        f.push(a);
			//        f.push(b);
			//        var P = {
			//            filters: f,
			//            success: function (o) {
			//                d.hideBusy();
			//                for (var i = 0; i < o.results.length; i++) {
			//                    if (o.results[i].ApproverEmployeeID === "00000000") {
			//                        delete o.results[i];
			//                    }
			//                }
			//                if (o.results.length === 0 && d.searchString === "") {
			//                    o.results[0] = {
			//                        Name: d.byId("approver").getValue(),
			//                        EmployeeID: d.approverIdSelected
			//                    };
			//                }
			//                var m = new sap.ui.model.json.JSONModel(o.results);
			//                m.setProperty("/DialogTitle", c.oBundle.getText("searchApprover"));
			//                var h = new sap.m.StandardListItem({
			//                    title: "{Name}",
			//                    description: "{EmployeeID}",
			//                    active: "true",
			//                    customData: [{
			//                            key: "Pernr",
			//                            value: "{EmployeeID}"
			//                        }]
			//                });
			//                d.getView().setModel(m, "approver");
			//            },
			//            error: function (E) {
			//                c.processError(E);
			//            }
			//        };
			//        this.oDataModel.read(p, P);
			//    },
			//    onSaveFavorite: function (e) {
			//        var v = this.getView();
			//        var d = v.byId("favoriteDialog");
			//        if (!d) {
			//            var o = {
			//                handleConfirm: this.handleConfirm.bind(this),
			//                handleSearch: this.handleSearchEventTypes.bind(this),
			//                handleClose: function (E) {
			//                    var b = E.getSource().getBinding("items");
			//                    var r = [];
			//                    b.filter(r, "Application");
			//                }
			//            };
			//            d = sap.ui.xmlfragment(v.getId(), "hcm.fab.mytimeevents.view.fragments.FavoritesDialog", o);
			//            v.addDependent(d);
			//        }
			//        jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), d);
			//        d.open();
			//    },
			//    onMessagesBtnClick: function (e) {
			//        var a = this;
			//        var v = this.getView();
			//        var d = v.byId("messagesDialog");
			//        if (!d) {
			//            var o = {
			//                onConfirm: function (b) {
			//                    var s = b.getParameter("selectedItems");
			//                    var c = s[0].data().MessageDate;
			//                    a.selectedDate = c;
			//                    if (sap.ui.Device.system.phone === true) {
			//                        a.mCalendar.setDateValue(a.selectedDate);
			//                    } else {
			//                        a.calendar.removeAllSelectedDates();
			//                        a.calendar.addSelectedDate(new sap.ui.unified.DateRange({
			//                            startDate: a.selectedDate,
			//                            endDate: a.selectedDate
			//                        }));
			//                        a.calendar.focusDate(a.selectedDate);
			//                        a.calendar.fireStartDateChange();
			//                    }
			//                    a.setSelectedDate(a.selectedDate);
			//                    a.getEvents(a.selectedDate);
			//                    a.byId("idIconTabBarNoIcons").setSelectedKey("eventList");
			//                },
			//                handleCancel: function (b) {
			//                    d.destroy();
			//                }
			//            };
			//            d = sap.ui.xmlfragment(v.getId(), "hcm.fab.mytimeevents.view.fragments.MessagesDialog", o);
			//            v.addDependent(d);
			//        }
			//        jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), d);
			//        d.open();
			//    },
			//    onBalancesBtnClick: function (e) {
			//        var a = this;
			//        var v = this.getView();
			//        var d = v.byId("balancesDialog");
			//        if (!d) {
			//            var o = {
			//                onCancel: function (b) {
			//                    d.destroy();
			//                }
			//            };
			//            d = sap.ui.xmlfragment(v.getId(), "hcm.fab.mytimeevents.view.fragments.BalancesDialog", o);
			//            v.addDependent(d);
			//        }
			//        jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), d);
			//        d.open();
			//    },
			//    onSelectionChange: function (e, a) {
			//        var b = this;
			//        var c;
			//        if (a) {
			//            c = a;
			//        } else {
			//            var s = e.getParameter("selectedItem");
			//            if (s) {
			//                c = s.getProperty("key");
			//            }
			//        }
			//        var p = new sap.ui.model.Filter({
			//            path: "TimeType",
			//            operator: sap.ui.model.FilterOperator.EQ,
			//            value1: c
			//        });
			//        var f = [];
			//        f.push(p);
			//        var A = new sap.ui.model.json.JSONModel();
			//        var F = b.byId("ADD_FIELDS");
			//        F.destroyFormElements();
			//        var P = {
			//            filters: f,
			//            success: function (d, r) {
			//                var h = d;
			//                if (h) {
			//                    for (var i = 0; i < h.results.length; i++) {
			//                        switch (h.results[i].TypeKind) {
			//                        case "D":
			//                            h.results[i].TypeKind = "Date";
			//                            h.results[i].DateVisible = true;
			//                            h.results[i].InputIntegerVisible = false;
			//                            h.results[i].InputDecimalVisible = false;
			//                            h.results[i].InputTextVisible = false;
			//                            h.results[i].TimeVisible = false;
			//                            break;
			//                        case "N":
			//                            h.results[i].TypeKind = "Number";
			//                            h.results[i].InputIntegerVisible = true;
			//                            h.results[i].InputTextVisible = false;
			//                            h.results[i].InputDecimalVisible = false;
			//                            h.results[i].DateVisible = false;
			//                            h.results[i].TimeVisible = false;
			//                            break;
			//                        case "P":
			//                            h.results[i].TypeKind = "Number";
			//                            h.results[i].InputIntegerVisible = false;
			//                            h.results[i].InputTextVisible = false;
			//                            h.results[i].InputDecimalVisible = true;
			//                            h.results[i].DateVisible = false;
			//                            h.results[i].TimeVisible = false;
			//                            break;
			//                        case "C":
			//                            h.results[i].TypeKind = "Text";
			//                            h.results[i].InputTextVisible = true;
			//                            h.results[i].InputIntegerVisible = false;
			//                            h.results[i].InputDecimalVisible = false;
			//                            h.results[i].DateVisible = false;
			//                            h.results[i].TimeVisible = false;
			//                            break;
			//                        case "T":
			//                            h.results[i].TypeKind = "Time";
			//                            h.results[i].TimeVisible = true;
			//                            h.results[i].DateVisible = false;
			//                            h.results[i].InputDecimalVisible = false;
			//                            h.results[i].InputTextVisible = false;
			//                            h.results[i].InputIntegerVisible = false;
			//                            break;
			//                        default:
			//                            h.results[i].TypeKind = "Text";
			//                            h.results[i].InputTextVisible = true;
			//                            h.results[i].InputIntegerVisible = false;
			//                            h.results[i].InputDecimalVisible = false;
			//                            h.results[i].DateVisible = false;
			//                            h.results[i].TimeVisible = false;
			//                        }
			//                        if (h.results[i].HasF4 === "X") {
			//                            h.results[i].HasF4 = true;
			//                        } else {
			//                            h.results[i].HasF4 = false;
			//                        }
			//                        if (h.results[i].Name === "ValuationBasis") {
			//                            h.results[i].value = parseFloat("0.00");
			//                        } else if (h.results[i].Name === "TimeRecIDNo") {
			//                            h.results[i].value = "00000000";
			//                        } else if (h.results[i].Name === "PremiumID") {
			//                            h.results[i].value = "0000";
			//                        } else if (h.results[i].Name === "Position") {
			//                            h.results[i].value = "00000000";
			//                        } else if (h.results[i].Name === "SalesOrderItem") {
			//                            h.results[i].value = "000000";
			//                        }
			//                        A.setData(h.results);
			//                        b.setModel(A, "AdditionalFields");
			//                        var o = new sap.ui.layout.form.FormElement({
			//                            label: new sap.m.Label({ text: "{FieldLabel}" }),
			//                            fields: [
			//                                new sap.m.Input({
			//                                    value: "{path:'value', type: 'sap.ui.model.type.Integer'}",
			//                                    type: "{TypeKind}",
			//                                    enabled: "{= ${Readonly} ? false : true}",
			//                                    showValueHelp: "{HasF4}",
			//                                    valueHelpRequest: b.onValueHelp.bind(b),
			//                                    visible: "{InputIntegerVisible}",
			//                                    required: "{path:'Required',formatter:'hcm.fab.mytimeevents.utils.formatter.isRequired'}",
			//                                    layoutData: new sap.ui.layout.GridData({ span: "L5 M5 S12" }),
			//                                    customData: [
			//                                        new sap.ui.core.CustomData({
			//                                            "key": "FieldName",
			//                                            "value": "{Name}"
			//                                        }),
			//                                        new sap.ui.core.CustomData({
			//                                            "key": "ValueHelp",
			//                                            "value": "{F4EntityName}"
			//                                        }),
			//                                        new sap.ui.core.CustomData({
			//                                            "key": "FieldLabel",
			//                                            "value": "{FieldLabel}"
			//                                        })
			//                                    ]
			//                                }),
			//                                new sap.m.Input({
			//                                    value: "{path:'value', type: 'sap.ui.model.type.Decimal'}",
			//                                    type: "{TypeKind}",
			//                                    enabled: "{= ${Readonly} ? false : true}",
			//                                    showValueHelp: "{HasF4}",
			//                                    valueHelpRequest: b.onValueHelp.bind(b),
			//                                    visible: "{InputDecimalVisible}",
			//                                    required: "{path:'Required',formatter:'hcm.fab.mytimeevents.utils.formatter.isRequired'}",
			//                                    layoutData: new sap.ui.layout.GridData({ span: "L5 M5 S12" }),
			//                                    customData: [
			//                                        new sap.ui.core.CustomData({
			//                                            "key": "FieldName",
			//                                            "value": "{Name}"
			//                                        }),
			//                                        new sap.ui.core.CustomData({
			//                                            "key": "ValueHelp",
			//                                            "value": "{F4EntityName}"
			//                                        }),
			//                                        new sap.ui.core.CustomData({
			//                                            "key": "FieldLabel",
			//                                            "value": "{FieldLabel}"
			//                                        })
			//                                    ]
			//                                }),
			//                                new sap.m.Input({
			//                                    value: "{path:'value'}",
			//                                    type: "{TypeKind}",
			//                                    enabled: "{= ${Readonly} ? false : true}",
			//                                    showValueHelp: "{HasF4}",
			//                                    valueHelpRequest: b.onValueHelp.bind(b),
			//                                    visible: "{InputTextVisible}",
			//                                    required: "{path:'Required',formatter:'hcm.fab.mytimeevents.utils.formatter.isRequired'}",
			//                                    layoutData: new sap.ui.layout.GridData({ span: "L5 M5 S12" }),
			//                                    customData: [
			//                                        new sap.ui.core.CustomData({
			//                                            "key": "FieldName",
			//                                            "value": "{Name}"
			//                                        }),
			//                                        new sap.ui.core.CustomData({
			//                                            "key": "ValueHelp",
			//                                            "value": "{F4EntityName}"
			//                                        }),
			//                                        new sap.ui.core.CustomData({
			//                                            "key": "FieldLabel",
			//                                            "value": "{FieldLabel}"
			//                                        })
			//                                    ]
			//                                }),
			//                                new sap.m.DatePicker({
			//                                    value: "{ path: 'datevalue', type: 'sap.ui.model.odata.type.Date'}",
			//                                    visible: "{DateVisible}",
			//                                    enabled: "{= ${Readonly} ? false : true}",
			//                                    layoutData: new sap.ui.layout.GridData({ span: "L5 M5 S12" }),
			//                                    customData: new sap.ui.core.CustomData({
			//                                        "key": "FieldName",
			//                                        "value": "{Name}"
			//                                    }, new sap.ui.core.CustomData({
			//                                        "key": "FieldLabel",
			//                                        "value": "{FieldLabel}"
			//                                    }))
			//                                }),
			//                                new sap.m.TimePicker({
			//                                    value: "{ path: 'timevalue', type: 'sap.ui.model.odata.type.Time' }",
			//                                    enabled: "{= ${Readonly} ? false : true}",
			//                                    visible: "{TimeVisible}",
			//                                    layoutData: new sap.ui.layout.GridData({ span: "L5 M5 S12" }),
			//                                    customData: new sap.ui.core.CustomData({
			//                                        "key": "FieldName",
			//                                        "value": "{Name}"
			//                                    }, new sap.ui.core.CustomData({
			//                                        "key": "FieldLabel",
			//                                        "value": "{FieldLabel}"
			//                                    }))
			//                                })
			//                            ]
			//                        });
			//                    }
			//                }
			//                F.setModel(A);
			//                if (o) {
			//                    F.bindAggregation("formElements", "/", o);
			//                }
			//            },
			//            error: function (E) {
			//                b.processError(E);
			//            }
			//        };
			//        this.oDataModel.read("/AdditionalFieldSet", P);
			//    },
			//    onFavPress: function (e) {
			//        var s = e.getSource().data();
			//        s.date = new Date();
			//        var d = sap.ui.core.format.DateFormat.getDateInstance({ style: "medium" }).format(new Date());
			//        var a = sap.ui.core.format.DateFormat.getTimeInstance({ style: "medium" }).format(new Date());
			//        ;
			//        var b = [
			//            {
			//                label: this.oBundle.getText("eventType"),
			//                text: s.SubtypeText
			//            },
			//            {
			//                label: this.oBundle.getText("date"),
			//                text: d
			//            },
			//            {
			//                label: this.oBundle.getText("time"),
			//                text: a
			//            }
			//        ];
			//        var S = {
			//            showNote: false,
			//            title: this.oBundle.getText("submissionConfirmation"),
			//            confirmButtonLabel: this.oBundle.getText("OK"),
			//            additionalInformation: b
			//        };
			//        this.openConfirmationPopup(S, "F", s);
			//    },
			//    handleConfirm: function (e) {
			//        var a = this;
			//        var b = e.getSource().getBinding("items").oList;
			//        var s = [];
			//        var l = 0;
			//        for (var n = 0; n < b.length; n++) {
			//            if (b[n].selected) {
			//                s[l] = b[n];
			//                l++;
			//            }
			//        }
			//        var m = this.oDataModel;
			//        m.setChangeBatchGroups({
			//            "*": {
			//                groupId: "Favorites",
			//                changeSetId: "Favorites",
			//                single: false
			//            }
			//        });
			//        m.setDeferredGroups(["Favorites"]);
			//        m.refreshSecurityToken(function (d) {
			//            if (s.length > 0) {
			//                for (var i = 0; i < s.length; i++) {
			//                    var o = {
			//                        properties: {
			//                            EmployeeID: a.empID,
			//                            Subtype: s[i].TimeType,
			//                            SubtypeText: s[i].TimeTypeText
			//                        },
			//                        success: function (d) {
			//                            var c = a.oBundle.getText("favoriteCreated");
			//                            sap.m.MessageToast.show(c, { duration: 1000 });
			//                            a.getFavorites();
			//                            a.getEventTypes();
			//                            a.calendar.removeAllSelectedDates();
			//                            a.calendar.addSelectedDate(new sap.ui.unified.DateRange({
			//                                startDate: new Date(),
			//                                endDate: new Date()
			//                            }));
			//                            a.selectedDate = new Date();
			//                            a.getEvents(a.selectedDate);
			//                        },
			//                        error: function (E) {
			//                            a.processError(E);
			//                        },
			//                        changeSetId: "Favorites",
			//                        groupId: "Favorites"
			//                    };
			//                    m.createEntry("/FavoritesSet", o);
			//                }
			//            } else {
			//                var o = {
			//                    properties: {
			//                        EmployeeID: a.empID,
			//                        Subtype: " ",
			//                        SubtypeText: " "
			//                    },
			//                    success: function (d) {
			//                        var c = a.oBundle.getText("favoriteDeleted");
			//                        sap.m.MessageToast.show(c, { duration: 1000 });
			//                        a.getFavorites();
			//                        a.getEventTypes();
			//                        a.calendar.removeAllSelectedDates();
			//                        a.calendar.addSelectedDate(new sap.ui.unified.DateRange({
			//                            startDate: new Date(),
			//                            endDate: new Date()
			//                        }));
			//                        a.selectedDate = new Date();
			//                        a.getEvents(a.selectedDate);
			//                    },
			//                    error: function (E) {
			//                        a.processError(E);
			//                    }
			//                };
			//                m.createEntry("/FavoritesSet", o);
			//            }
			//            m.submitChanges({
			//                groupId: "Favorites",
			//                changeSetId: "Favorites"
			//            });
			//        }, true);
			//    },
			//    onValueHelp: function (e) {
			//        var a = this;
			//        var v = this.getView();
			//        var d = v.byId("valueHelpDialog");
			//        a.valueHelpControlId = e.getSource().getId();
			//        var f = e.getSource().getCustomData()[0].getValue();
			//        var b = "/" + e.getSource().getCustomData()[1].getValue();
			//        var c = this.getModel("AdditionalFields").getData();
			//        var p = {
			//            success: function (o) {
			//                var h = o.results;
			//                var r = [];
			//                var i = {};
			//                var F = c[a.valueHelpControlId.split("ADD_FIELDS-")[1]].F4Title;
			//                var j = c[a.valueHelpControlId.split("ADD_FIELDS-")[1]].F4Description;
			//                var m = new sap.ui.model.json.JSONModel();
			//                var r = h.map(function (I) {
			//                    var l = jQuery.extend({}, I, true);
			//                    l.title = I[F];
			//                    l.description = I[j];
			//                    return l;
			//                });
			//                m.setData(r);
			//                m.setProperty("/DialogTitle", c[a.valueHelpControlId.split("ADD_FIELDS-")[1]].FieldLabel);
			//                var s = new sap.m.StandardListItem({
			//                    type: sap.m.ListType.Active,
			//                    title: "{" + c[a.valueHelpControlId.split("ADD_FIELDS-")[1]].F4Title + "}",
			//                    description: "{" + c[a.valueHelpControlId.split("ADD_FIELDS-")[1]].F4Description + "}",
			//                    press: function (l) {
			//                        var n = a.valueHelpControlId.split("ADD_FIELDS-")[1];
			//                        var u = l.getSource().getTitle();
			//                        this.byId("ADD_FIELDS").getFormElements()[n].getFields()[0].setValue(u);
			//                        this.dialogInstance.close();
			//                        this.dialogInstance = null;
			//                    }.bind(a)
			//                });
			//                v.setModel(m, "valueHelpSet");
			//                if (!d) {
			//                    var k = {
			//                        handleConfirm: function (l) {
			//                            var n = a.valueHelpControlId.split("ADD_FIELDS-")[1];
			//                            var u = l.getParameter("selectedItem").getTitle();
			//                            if (this.byId("ADD_FIELDS").getFormElements()[n].getFields()[0].getVisible()) {
			//                                this.byId("ADD_FIELDS").getFormElements()[n].getFields()[0].setValue(u);
			//                            } else if (this.byId("ADD_FIELDS").getFormElements()[n].getFields()[1].getVisible()) {
			//                                this.byId("ADD_FIELDS").getFormElements()[n].getFields()[1].setValue(u);
			//                            } else if (this.byId("ADD_FIELDS").getFormElements()[n].getFields()[2].getVisible()) {
			//                                this.byId("ADD_FIELDS").getFormElements()[n].getFields()[2].setValue(u);
			//                            }
			//                            d.destroy();
			//                        }.bind(a),
			//                        handleCancel: function (l) {
			//                            d.destroy();
			//                        }
			//                    };
			//                    d = sap.ui.xmlfragment(v.getId(), "hcm.fab.mytimeevents.view.fragments.SearchHelper", k);
			//                    v.addDependent(d);
			//                }
			//                jQuery.sap.syncStyleClass("sapUiSizeCompact", v, d);
			//                d.open();
			//            },
			//            error: function (E) {
			//                a.processError(E);
			//            }
			//        };
			//        this.oDataModel.read(b, p);
			//    },
			//    onNavBack: function () {
			//        var p = H.getInstance().getPreviousHash(), c = sap.ushell.Container.getService("CrossApplicationNavigation");
			//        if (p !== undefined || !c.isInitialNavigation()) {
			//            history.go(-1);
			//        } else {
			//            c.toExternal({ target: { shellHash: "#Shell-home" } });
			//        }
			//    },
			//    handleSearchEventTypes: function (e) {
			//        var a = this;
			//        var f = [];
			//        var F = [];
			//        var Q = e.getParameter("value");
			//        var b = e.getSource().getBinding("items");
			//        var c = new sap.ui.model.Filter("TimeTypeText", sap.ui.model.FilterOperator.Contains, Q);
			//        F.push(c);
			//        var d = new sap.ui.model.Filter("TimeType", sap.ui.model.FilterOperator.Contains, Q);
			//        F.push(d);
			//        if (Q && Q.length > 0) {
			//            var h = new sap.ui.model.Filter({
			//                filters: F,
			//                and: false
			//            });
			//            f.push(h);
			//        }
			//        b.filter(f, "Application");
			//        if (b.iLength === 0) {
			//            this.byId("favoriteDialog")._oOkButton.setEnabled(false);
			//        } else {
			//            this.byId("favoriteDialog")._oOkButton.setEnabled(true);
			//        }
			//    },
			//    handleChange: function () {
			//        if (this.setTimeIntervalDetails) {
			//            clearInterval(this.setTimeIntervalDetails);
			//            this.setTimeIntervalDetails = null;
			//        }
			//    },
			//    onStartDateChange: function (e) {
			//        var d = new Date();
			//        if (sap.ui.Device.system.phone === true) {
			//            this.dateFrom = new Date(e.getParameters().dateRange.getStartDate());
			//            d = e.getParameters().dateRange.getEndDate();
			//        } else {
			//            this.dateFrom = new Date(this.calendar.getStartDate());
			//            d.setYear(this.calendar.getStartDate().getFullYear());
			//            d.setMonth(this.byId("calendar").getStartDate().getMonth() + 2, 0);
			//        }
			//        this.dateTo = d;
			//        if (!(this.selectedDate >= this.dateFrom && this.selectedDate <= this.dateTo)) {
			//            this.selectedDate = this.dateFrom;
			//        }
			//    },
			//    getTimeEvalMessages: function (e) {
			//        var b = this;
			//        var m = new sap.ui.model.json.JSONModel();
			//        var c = new sap.ui.model.Filter({
			//            path: "Pernr",
			//            operator: sap.ui.model.FilterOperator.EQ,
			//            value1: e
			//        });
			//        var f = [];
			//        f.push(c);
			//        var p = {
			//            filters: f,
			//            success: function (d) {
			//                var a = d.results;
			//                for (var i = 0; i < a.length; i++) {
			//                    var h = sap.ui.core.format.DateFormat.getDateInstance({ style: "medium" }).format(a[i].MessageDate);
			//                    a[i].DispDate = h;
			//                }
			//                if (a.length > 0) {
			//                    b.byId("messages").setEnabled(true);
			//                    b.byId("messages").setText(b.oBundle.getText("messages", [a.length]));
			//                } else {
			//                    b.byId("messages").setEnabled(false);
			//                    b.byId("messages").setText(b.oBundle.getText("messagesText"));
			//                }
			//                m.setData(a);
			//                b.setModel(m, "Messages");
			//            },
			//            error: function (E) {
			//                b.processError(E);
			//            }
			//        };
			//        this.oDataModel.read("/MessageSet", p);
			//    },
			//    getBalances: function (e) {
			//        var a = this;
			//        var m = new sap.ui.model.json.JSONModel();
			//        var b = new sap.ui.model.Filter({
			//            path: "EmployeeID",
			//            operator: sap.ui.model.FilterOperator.EQ,
			//            value1: e
			//        });
			//        var f = [];
			//        f.push(b);
			//        var p = {
			//            filters: f,
			//            success: function (d) {
			//                if (d.results.length > 0) {
			//                    a.byId("balances").setEnabled(true);
			//                } else {
			//                    a.byId("messages").setEnabled(false);
			//                }
			//                m.setData(d.results);
			//                a.setModel(m, "Balances");
			//            },
			//            error: function (E) {
			//                a.processError(E);
			//            }
			//        };
			//        this.oDataModel.read("/BalancesSet", p);
			//    },
			//    getEvents: function (d) {
			//        var c = this;
			//        this.byId("idEventsTable").setBusy(true);
			//        var a = new sap.ui.model.Filter({
			//            path: "EventDate",
			//            operator: sap.ui.model.FilterOperator.EQ,
			//            value1: this.oFormatYyyymmdd.format(d)
			//        });
			//        var b = new sap.ui.model.Filter({
			//            path: "EmployeeID",
			//            operator: sap.ui.model.FilterOperator.EQ,
			//            value1: this.empID
			//        });
			//        var f = [];
			//        f.push(a);
			//        f.push(b);
			//        var m = new sap.ui.model.json.JSONModel();
			//        var p = {
			//            filters: f,
			//            success: function (e, R) {
			//                c.byId("idEventsTable").setBusy(false);
			//                var a = e;
			//                c.timeEvents = a;
			//                var h = [];
			//                for (var i = 0; i < a.results.length; i++) {
			//                    try {
			//                        var j = new Date(a.results[i].EventDate);
			//                        var l = new Date(j.getUTCFullYear(), j.getUTCMonth(), j.getUTCDate());
			//                        d = l;
			//                    } catch (o) {
			//                        d = new Date(a.results[i].EventDate);
			//                    }
			//                    a.results[i].EventDate = d;
			//                    switch (a.results[i].Status) {
			//                    case "APPROVED":
			//                        a.results[i].State = "Success";
			//                        break;
			//                    case "POSTED":
			//                        a.results[i].State = "Success";
			//                        break;
			//                    case "REJECTED":
			//                        a.results[i].State = "Error";
			//                        break;
			//                    case "SENT":
			//                        a.results[i].State = "Warning";
			//                        break;
			//                    case "HOLIDAY":
			//                        h.push(i);
			//                        break;
			//                    case "NONWORKING":
			//                        h.push(i);
			//                        break;
			//                    }
			//                    if (c.configuration.ModifyAllowed && !c.configuration.ModifyAllowed) {
			//                        a.results[i].type = "Navigation";
			//                        a.results[i].change = false;
			//                    } else {
			//                        switch (a.results[i].Origin) {
			//                        case "E":
			//                            a.results[i].type = "Navigation";
			//                            a.results[i].change = true;
			//                            break;
			//                        case "":
			//                        case "S":
			//                            if (c.configuration.ModifySubsystem !== undefined && c.configuration.ModifySubsystem == "X") {
			//                                a.results[i].type = "Navigation";
			//                                a.results[i].change = true;
			//                            } else {
			//                                a.results[i].type = "Navigation";
			//                                a.results[i].change = false;
			//                            }
			//                            break;
			//                        default:
			//                            a.results[i].type = "Navigation";
			//                            a.results[i].change = false;
			//                            break;
			//                        }
			//                    }
			//                }
			//                if (h) {
			//                    for (var r = h.length - 1; r >= 0; r--) {
			//                        a.results.splice(h[r], 1);
			//                    }
			//                }
			//                m.setData(a.results);
			//                c.byId("idEventsTable").setModel(m, "timeEventList");
			//                var n = c.byId("idEventsTable").getItems();
			//                for (var k = 0; k < n.length; k++) {
			//                    if (a.results[k].Origin !== "E") {
			//                        if (n[k].getDeleteControl()) {
			//                            n[k].getDeleteControl().setVisible(false);
			//                        } else {
			//                            n[k].getDeleteControl(event).setVisible(false);
			//                        }
			//                    } else {
			//                        if (n[k].getDeleteControl()) {
			//                            n[k].getDeleteControl().setVisible(true);
			//                        } else {
			//                            n[k].getDeleteControl(event).setVisible(true);
			//                        }
			//                    }
			//                }
			//                if (c.NoCalendarInit === "true") {
			//                    c.NoCalendarInit = "false";
			//                } else {
			//                    c.initCalendar(c.empID);
			//                }
			//            },
			//            error: function (e) {
			//                c.byId("idEventsTable").setBusy(false);
			//                c.processError(e);
			//            }
			//        };
			//        this.oDataModel.read("/TimeEventSet", p);
			//    },
			//    getEventTypes: function (p) {
			//        var b = this;
			//        var a = new sap.ui.model.Filter({
			//            path: "EmployeeID",
			//            operator: sap.ui.model.FilterOperator.EQ,
			//            value1: this.empID
			//        });
			//        var f = [];
			//        f.push(a);
			//        var m = new sap.ui.model.json.JSONModel();
			//        var P = {
			//            filters: f,
			//            success: function (d, r) {
			//                var a = d;
			//                var F = b.getModel("FavoritesSet").getData();
			//                for (var i = 0; i < F.length; i++) {
			//                    for (var j = 0; j < a.results.length; j++) {
			//                        if (F[i].Subtype == a.results[j].TimeType) {
			//                            a.results[j].selected = true;
			//                        }
			//                    }
			//                }
			//                m.setData(a.results);
			//                b.setGlobalModel(m, "eventTypeModel");
			//                b.setModel(m, "timeEventType");
			//            },
			//            error: function (e) {
			//                b.processError(e);
			//            }
			//        };
			//        this.oDataModel.read("/TimeEventTypeSet", P);
			//    },
			//    initCalendarLegend: function () {
			//        if (this.legend) {
			//            this.legend.addItem(new sap.ui.unified.CalendarLegendItem({
			//                text: this.oBundle.getText("approved"),
			//                type: sap.ui.unified.CalendarDayType.Type08
			//            }));
			//            this.legend.addItem(new sap.ui.unified.CalendarLegendItem({
			//                text: this.oBundle.getText("rejected"),
			//                type: sap.ui.unified.CalendarDayType.Type03
			//            }));
			//            this.legend.addItem(new sap.ui.unified.CalendarLegendItem({
			//                text: this.oBundle.getText("sent"),
			//                type: sap.ui.unified.CalendarDayType.Type00
			//            }));
			//            this.legend.addItem(new sap.ui.unified.CalendarLegendItem({
			//                text: this.oBundle.getText("holiday"),
			//                type: sap.ui.unified.CalendarDayType.Type09
			//            }));
			//        }
			//        if (this.mlegend) {
			//            this.mlegend.addItem(new sap.ui.unified.CalendarLegendItem({
			//                text: this.oBundle.getText("approved"),
			//                type: sap.ui.unified.CalendarDayType.Type08
			//            }));
			//            this.mlegend.addItem(new sap.ui.unified.CalendarLegendItem({
			//                text: this.oBundle.getText("rejected"),
			//                type: sap.ui.unified.CalendarDayType.Type03
			//            }));
			//            this.mlegend.addItem(new sap.ui.unified.CalendarLegendItem({
			//                text: this.oBundle.getText("sent"),
			//                type: sap.ui.unified.CalendarDayType.Type00
			//            }));
			//            this.mlegend.addItem(new sap.ui.unified.CalendarLegendItem({
			//                text: this.oBundle.getText("holiday"),
			//                type: sap.ui.unified.CalendarDayType.Type09
			//            }));
			//        }
			//    },
			//    initCalendar: function (P) {
			//        var d = this;
			//        var f = [];
			//        var a = new sap.ui.model.Filter({
			//            path: "EmployeeID",
			//            operator: sap.ui.model.FilterOperator.EQ,
			//            value1: P
			//        });
			//        var b = new sap.ui.model.Filter({
			//            path: "DateFrom",
			//            operator: sap.ui.model.FilterOperator.EQ,
			//            value1: this.dateFrom
			//        });
			//        var c = new sap.ui.model.Filter({
			//            path: "DateTo",
			//            operator: sap.ui.model.FilterOperator.EQ,
			//            value1: this.dateTo
			//        });
			//        f.push(a);
			//        if (this.dateFrom && this.dateTo) {
			//            f.push(b);
			//            f.push(c);
			//        }
			//        var p = {
			//            filters: f,
			//            success: function (e, r) {
			//                d.calendar.removeAllSpecialDates();
			//                d.mCalendar.removeAllSpecialDates();
			//                var a = e;
			//                var h;
			//                for (var i = 0; i < a.results.length; i++) {
			//                    try {
			//                        var j = new Date(a.results[i].EventDate);
			//                        var k = new Date(j.getUTCFullYear(), j.getUTCMonth(), j.getUTCDate());
			//                        h = k;
			//                    } catch (o) {
			//                        h = new Date(a.results[i].EventDate);
			//                    }
			//                    a.results[i].EventDate = h;
			//                    switch (a.results[i].Status) {
			//                    case "APPROVED":
			//                        a.results[i].Type = sap.ui.unified.CalendarDayType.Type08;
			//                        a.results[i].Tooltip = d.oBundle.getText("approved");
			//                        break;
			//                    case "POSTED":
			//                        a.results[i].Type = sap.ui.unified.CalendarDayType.Type08;
			//                        a.results[i].Tooltip = d.oBundle.getText("approved");
			//                        break;
			//                    case "REJECTED":
			//                        a.results[i].Type = sap.ui.unified.CalendarDayType.Type03;
			//                        a.results[i].Tooltip = d.oBundle.getText("rejected");
			//                        break;
			//                    case "SENT":
			//                        a.results[i].Type = sap.ui.unified.CalendarDayType.Type00;
			//                        a.results[i].Tooltip = d.oBundle.getText("sent");
			//                        break;
			//                    case "HOLIDAY":
			//                        a.results[i].Type = sap.ui.unified.CalendarDayType.Type09;
			//                        if (a.results[i].StatusText != "") {
			//                            a.results[i].Tooltip = a.results[i].StatusText;
			//                        } else {
			//                            a.results[i].Tooltip = d.oBundle.getText("holiday");
			//                        }
			//                        break;
			//                    case "NONWORKING":
			//                        a.results[i].Type = sap.ui.unified.CalendarDayType.NonWorking;
			//                        a.results[i].Tooltip = d.oBundle.getText("nonworking");
			//                        break;
			//                    }
			//                    d.calendar.addSpecialDate(new sap.ui.unified.DateTypeRange({
			//                        startDate: new Date(a.results[i].EventDate),
			//                        type: a.results[i].Type,
			//                        tooltip: a.results[i].Tooltip
			//                    }));
			//                    d.mCalendar.addSpecialDate(new sap.ui.unified.DateTypeRange({
			//                        startDate: new Date(a.results[i].EventDate),
			//                        type: a.results[i].Type,
			//                        tooltip: a.results[i].Tooltip
			//                    }));
			//                }
			//                d.calendar.setBusy(false);
			//            },
			//            error: function (e) {
			//                d.calendar.setBusy(false);
			//                d.processError(e);
			//            }
			//        };
			//        this.byId("calendar").setBusy(true);
			//        this.oDataModel.read("/TimeEventSet", p);
			//    },
			//    showBusy: function () {
			//        this._nCounter++;
			//        if (this._nCounter === 1) {
			//            this.busyDialog.open();
			//        }
			//    },
			//    hideBusy: function (f) {
			//        if (this._nCounter === 0) {
			//            return;
			//        }
			//        this._nCounter = f ? 0 : Math.max(0, this._nCounter - 1);
			//        if (this._nCounter > 0) {
			//            return;
			//        }
			//        this.busyDialog.close();
			//    },
			    getConfiguration: function () {
			        var m = new sap.ui.model.json.JSONModel();
			        this.setGlobalModel(m, "configurationModel");
			        var a = this;
			        this.showBusy();
			        var b = new sap.ui.model.Filter({
			            path: "EmployeeID",
			            operator: sap.ui.model.FilterOperator.EQ,
			            value1: this.empID
			        });
			        var f = [];
			        f.push(b);
			        var p = {
			            filters: f,
			            success: function (d) {
			                a.hideBusy();
			                m.setData(d.results[0]);
			                a.configuration = d.results[0];
			                a.getView().setModel(m, "configurationModel");
			                a.byId("idTimeEventType").setSelectedKey(a.configuration.DefaultEvent);
			                a.onSelectionChange(null, a.configuration.DefaultEvent);
			                a.byId("approver").setValue(a.configuration.ApproverName);
			                a.approverIdSelected = a.configuration.ApproverId;
			                var c = new Date();
			                if (a.configuration.CreateAllowed) {
			                    if (!a.configuration.PresentDayFlag) {
			                        a.byId("save").setEnabled(false);
			                    } else {
			                        a.byId("save").setEnabled(true);
			                    }
			                } else {
			                    a.byId("save").setEnabled(false);
			                }
			                if (a.configuration.PresentDayFlag) {
			                    if (a.configuration.CreateAllowed) {
			                        a.byId("save").setEnabled(true);
			                    } else {
			                        a.byId("save").setEnabled(false);
			                    }
			                } else {
			                    if (a.configuration.CreateAllowed) {
			                        a.byId("save").setEnabled(true);
			                    } else {
			                        a.byId("save").setEnabled(false);
			                    }
			                }
			                a.byId("datePicker").setDateValue(new Date());
			                if (a.configuration.TimeReadOnly) {
			                    a.byId("timePicker").setEnabled(false);
			                    a.byId("timePicker").setDateValue(new Date());
			                } else {
			                    a.byId("timePicker").setEnabled(true);
			                    a.byId("timePicker").setDateValue(new Date());
			                }
			                if (a.configuration.ApproverReadOnly === "X") {
			                    a.byId("approver").setEnabled(false);
			                } else {
			                    a.byId("approver").setEnabled(true);
			                }
			                if (a.configuration.NoticeVisible === "X") {
			                    a.byId("comments").setVisible(true);
			                    a.byId("commentsLableId").setVisible(true);
			                } else {
			                    a.byId("comments").setVisible(false);
			                    a.byId("commentsLableId").setVisible(false);
			                }
/*			                if (a.configuration.ApproverVisible === "X") {
			                    a.byId("approver").setVisible(true);
			                    a.byId("approverLableId").setVisible(true);
			                } else {
			                    a.byId("approver").setVisible(false);
			                    a.byId("approverLableId").setVisible(false);
			                }*/
			                if (!a.configuration.DeleteAllowed) {
			                    a.byId("idEventsTable").setMode("None");
			                }
			            },
			            error: function (e) {
			                a.hideBusy();
			                a.processError(e);
			            }
			        };
			        this.oDataModel.read("/ConfigurationSet", p);
			    },
			//    createTimeEvent: function (i, c) {
			//        var a = this;
			//        var d = new Date();
			//        this.showBusy();
			//        var s;
			//        if (i) {
			//            var o = this.createPostObject("F", c);
			//            this.selectedDate = new Date();
			//            if (this.selectedDate.getMonth() % 2 == 0) {
			//                s = this.selectedDate.getMonth();
			//            } else {
			//                s = this.selectedDate.getMonth() - 1;
			//            }
			//            d.setMonth(s, 1);
			//            this.dateFrom = d;
			//            d = new Date();
			//            if (sap.ui.Device.system.desktop === true) {
			//                d.setMonth(s + 2, 0);
			//            } else {
			//                d.setMonth(s + 1, 0);
			//            }
			//            this.dateTo = d;
			//        } else {
			//            var o = this.createPostObject("C");
			//            var b = this.getSelectedDate().getMonth();
			//            if (b % 2 == 0) {
			//                s = b;
			//            } else {
			//                s = b - 1;
			//            }
			//            d.setMonth(s, 1);
			//            d.setYear(this.getSelectedDate().getFullYear());
			//            this.dateFrom = d;
			//            d = new Date();
			//            d.setYear(this.getSelectedDate().getFullYear());
			//            if (sap.ui.Device.system.desktop === true) {
			//                d.setMonth(s + 2, 0);
			//            } else {
			//                d.setMonth(s + 1, 0);
			//            }
			//            this.dateTo = d;
			//        }
			//        this.oDataModel.create("/TimeEventSet", o, {
			//            success: function (e, r) {
			//                a.hideBusy();
			//                var f = a.oBundle.getText("timeEventCreated");
			//                sap.m.MessageToast.show(f, { duration: 1000 });
			//                if (sap.ui.Device.system.phone === true) {
			//                    a.mCalendar.setDateValue(a.selectedDate);
			//                } else {
			//                    a.calendar.removeAllSelectedDates();
			//                    a.calendar.addSelectedDate(new sap.ui.unified.DateRange({
			//                        startDate: a.selectedDate,
			//                        endDate: a.selectedDate
			//                    }));
			//                    a.calendar.focusDate(a.selectedDate);
			//                    a.calendar.fireStartDateChange();
			//                }
			//                a.getEvents(a.selectedDate);
			//            },
			//            error: function (e) {
			//                a.hideBusy();
			//                a.processError(e);
			//            }
			//        });
			//    },
			    onSave: function (e) {
			        if (this.extHookOnCreate) {
			            this.extHookOnCreate();
			        } else {
			            var a = this;
			            this.byId("idTimeEventType").setValueState("None");
			            this.byId("datePicker").setValueState("None");
			            this.byId("timePicker").setValueState("None");
			            this.oMessageManager.removeAllMessages();
			            if (this.setTimeIntervalDetails) {
			                clearInterval(this.setTimeIntervalDetails);
			            }
			            if (this.byId("idTimeEventType").getSelectedKey() === "" || this.byId("datePicker").getValue() === "") {
			                if (this.byId("idTimeEventType").getSelectedKey() === "") {
			                    this.byId("idTimeEventType").setValueState("Error");
			                    var f = this.byId("idTimeEventType").getParent().getLabel();
			                    this.oErrorHandler.pushError(a.oBundle.getText("invalidEntry"), this.oMessageManager, this.oMessageProcessor, f);
			                    this.byId("messageInd").firePress();
			                }
			                if (this.byId("datePicker").getValue() === "") {
			                    this.byId("datePicker").setValueState("Error");
			                    var f = this.byId("datePicker").getParent().getLabel();
			                    this.oErrorHandler.pushError(a.oBundle.getText("invalidEntry"), this.oMessageManager, this.oMessageProcessor, f);
			                }
			            } else {
			                for (var i = 0; i < this.byId("ADD_FIELDS").getFormElements().length; i++) {
			                    this.byId("ADD_FIELDS").getFormElements()[i].getFields()[0].setValueState("None");
			                    if (this.byId("ADD_FIELDS").getFormElements()[i].getFields()[0].getVisible()) {
			                        if (this.byId("ADD_FIELDS").getFormElements()[i].getFields()[0].getRequired() && this.byId("ADD_FIELDS").getFormElements()[i].getFields()[0].getValue() === "") {
			                            this.byId("ADD_FIELDS").getFormElements()[i].getFields()[0].setValueState("Error");
			                            f = this.byId("ADD_FIELDS").getFormElements()[i].getFields()[0].getCustomData()[2].getValue();
			                            this.oErrorHandler.pushError(this.oBundle.getText("invalidEntry"), this.oMessageManager, this.oMessageProcessor, f);
			                            this.byId("messageInd").firePress();
			                            return;
			                        }
			                    } else if (this.byId("ADD_FIELDS").getFormElements()[i].getFields()[1].getVisible()) {
			                        if (this.byId("ADD_FIELDS").getFormElements()[i].getFields()[1].getRequired() && this.byId("ADD_FIELDS").getFormElements()[i].getFields()[1].getValue() === "") {
			                            this.byId("ADD_FIELDS").getFormElements()[i].getFields()[1].setValueState("Error");
			                            f = this.byId("ADD_FIELDS").getFormElements()[1].getFields()[1].getCustomData()[2].getValue();
			                            this.oErrorHandler.pushError(this.oBundle.getText("invalidEntry"), this.oMessageManager, this.oMessageProcessor, f);
			                            this.byId("messageInd").firePress();
			                            return;
			                        }
			                    } else if (this.byId("ADD_FIELDS").getFormElements()[i].getFields()[2].getVisible()) {
			                        if (this.byId("ADD_FIELDS").getFormElements()[i].getFields()[2].getRequired() && this.byId("ADD_FIELDS").getFormElements()[i].getFields()[2].getValue() === "") {
			                            this.byId("ADD_FIELDS").getFormElements()[i].getFields()[2].setValueState("Error");
			                            f = this.byId("ADD_FIELDS").getFormElements()[i].getFields()[2].getCustomData()[2].getValue();
			                            this.oErrorHandler.pushError(this.oBundle.getText("invalidEntry"), this.oMessageManager, this.oMessageProcessor, f);
			                            this.byId("messageInd").firePress();
			                            return;
			                        }
			                    } else if (this.byId("ADD_FIELDS").getFormElements()[i].getFields()[3].getVisible()) {
			                        if (this.byId("ADD_FIELDS").getFormElements()[i].getFields()[3].getRequired() && this.byId("ADD_FIELDS").getFormElements()[i].getFields()[3].getDateValue() === "") {
			                            this.byId("ADD_FIELDS").getFormElements()[i].getFields()[3].setValueState("Error");
			                            f = this.byId("ADD_FIELDS").getFormElements()[i].getFields()[3].getCustomData()[1].getValue();
			                            this.oErrorHandler.pushError(this.oBundle.getText("invalidEntry"), this.oMessageManager, this.oMessageProcessor, f);
			                            this.byId("messageInd").firePress();
			                            return;
			                        }
			                    } else if (this.byId("ADD_FIELDS").getFormElements()[i].getFields()[4].getVisible()) {
			                        if (this.byId("ADD_FIELDS").getFormElements()[i].getFields()[4].getRequired() && this.byId("ADD_FIELDS").getFormElements()[i].getFields()[4].getDateValue() === "") {
			                            this.byId("ADD_FIELDS").getFormElements()[i].getFields()[4].setValueState("Error");
			                            f = this.byId("ADD_FIELDS").getFormElements()[i].getFields()[4].getCustomData()[1].getValue();
			                            this.oErrorHandler.pushError(this.oBundle.getText("invalidEntry"), this.oMessageManager, this.oMessageProcessor, f);
			                            this.byId("messageInd").firePress();
			                            continue;
			                        }
			                    }
			                }
			                var b = sap.ui.core.format.DateFormat.getTimeInstance({ pattern: this.byId("timePicker").getDisplayFormat() });
			                var d = sap.ui.core.format.DateFormat.getDateInstance({ pattern: this.byId("datePicker").getDisplayFormat() });
			                var c = b.format(this.byId("timePicker").getDateValue());
			                var h = d.format(this.byId("datePicker").getDateValue());
			                var j = [
			                    {
			                        label: this.oBundle.getText("eventType"),
			                        text: this.byId("idTimeEventType").getSelectedItem().getText()
			                    },
			                    {
			                        label: this.oBundle.getText("date"),
			                        text: h
			                    },
			                    {
			                        label: this.oBundle.getText("time"),
			                        text: c
			                    }
			                ];
			                var s = {
			                    showNote: false,
			                    title: this.oBundle.getText("submissionConfirmation"),
			                    confirmButtonLabel: this.oBundle.getText("OK"),
			                    additionalInformation: j
			                };
			                this.openConfirmationPopup(s, "C", null);
			            }
			        }
			    },
			//    createPostObject: function (a, c) {
			//        var b = sap.ui.core.format.DateFormat.getTimeInstance({ pattern: this.byId("timePicker").getDisplayFormat() });
			//        var d = sap.ui.core.format.DateFormat.getTimeInstance({ pattern: this.byId("datePicker").getDisplayFormat() });
			//        if (a === "C") {
			//            var e = this.formatTimeString(this.byId("timePicker").getDateValue());
			//            var f = this.formatDateTimeString(this.byId("datePicker").getDateValue());
			//            var h = this.byId("datePicker").getDateValue().getTimezoneOffset() / -60;
			//            var j = this.byId("idTimeEventType").getSelectedKey();
			//            h = h.toFixed(2);
			//            this.selectedDate = this.byId("datePicker").getDateValue();
			//            this.setSelectedDate(this.selectedDate);
			//            var p = {
			//                EmployeeID: this.empID,
			//                EventDate: f,
			//                EventTime: e,
			//                TimeType: j,
			//                TimezoneOffset: h.toString()
			//            };
			//            for (var i = 0; i < this.byId("ADD_FIELDS").getFormElements().length; i++) {
			//                if (this.byId("ADD_FIELDS").getFormElements()[i].getFields()[0].getVisible()) {
			//                    p[this.byId("ADD_FIELDS").getFormElements()[i].getFields()[0].getCustomData()[0].getValue()] = this.byId("ADD_FIELDS").getFormElements()[i].getFields()[0].getValue();
			//                } else if (this.byId("ADD_FIELDS").getFormElements()[i].getFields()[1].getVisible()) {
			//                    p[this.byId("ADD_FIELDS").getFormElements()[i].getFields()[1].getCustomData()[0].getValue()] = this.byId("ADD_FIELDS").getFormElements()[i].getFields()[1].getValue();
			//                } else if (this.byId("ADD_FIELDS").getFormElements()[i].getFields()[2].getVisible()) {
			//                    p[this.byId("ADD_FIELDS").getFormElements()[i].getFields()[2].getCustomData()[0].getValue()] = this.byId("ADD_FIELDS").getFormElements()[i].getFields()[2].getValue();
			//                } else if (this.byId("ADD_FIELDS").getFormElements()[i].getFields()[3].getVisible()) {
			//                    if (this.byId("ADD_FIELDS").getFormElements()[i].getFields()[3].getDateValue()) {
			//                        p[this.byId("ADD_FIELDS").getFormElements()[i].getFields()[3].getCustomData()[0].getValue()] = this.formatDateTimeString(this.byId("ADD_FIELDS").getFormElements()[i].getFields()[3].getDateValue());
			//                    }
			//                } else if (this.byId("ADD_FIELDS").getFormElements()[i].getFields()[4].getVisible()) {
			//                    if (this.byId("ADD_FIELDS").getFormElements()[i].getFields()[4].getDateValue()) {
			//                        p[this.byId("ADD_FIELDS").getFormElements()[i].getFields()[4].getCustomData()[0].getValue()] = this.formatTimeString(this.byId("ADD_FIELDS").getFormElements()[i].getFields()[4].getDateValue());
			//                    }
			//                }
			//            }
			//        } else if (a === "F") {
			//            var e = this.formatTimeString(c.date);
			//            var f = this.formatDateTimeString(c.date);
			//            var h = c.date.getTimezoneOffset() / -60;
			//            var j = c.Subtype;
			//            h = h.toFixed(2);
			//            var p = {
			//                EmployeeID: this.empID,
			//                EventDate: f,
			//                EventTime: e,
			//                TimeType: j,
			//                TimezoneOffset: h.toString()
			//            };
			//        } else {
			//            var e = this.formatTime(c.time);
			//            var f = this.formatDateTimeString(c.date);
			//            var h = c.date.getTimezoneOffset() / -60;
			//            h = h.toFixed(2);
			//            var p = {
			//                EmployeeID: this.empID,
			//                EventDate: f,
			//                EventTime: e,
			//                TimeType: j,
			//                TimezoneOffset: h.toString()
			//            };
			//        }
			//        if (this.approverIdSelected && this.configuration.ApproverVisible) {
			//            p.ApproverPernr = this.approverIdSelected;
			//        } else {
			//            p.ApproverPernr = this.configuration.ApproverId;
			//        }
			//        if (this.byId("comments").getValue() !== "") {
			//            p.Note = this.byId("comments").getValue();
			//        }
			//        if (a === "D") {
			//            p.ReqId = c.id;
			//            p.EventTime = c.time;
			//        }
			//        if (this.extHookCreatePostObject) {
			//            p = this.extHookCreatePostObject(p, a);
			//        }
			//        return p;
			//    },
			//    onDelete: function (e) {
			//        if (this.extHookOnDelete) {
			//            this.extHookOnDelete();
			//        } else {
			//            if (sap.ui.Device.system.phone === true) {
			//                var s = e.getSource().getParent().getParent().getSwipedItem();
			//            } else {
			//                var s = e.getParameter("listItem");
			//            }
			//            var d = sap.ui.core.format.DateFormat.getDateInstance({ style: "medium" }).format(s.data().date);
			//            var a = [
			//                {
			//                    label: this.oBundle.getText("eventType"),
			//                    text: s.getCells()[0].getText()
			//                },
			//                {
			//                    label: this.oBundle.getText("date"),
			//                    text: d
			//                },
			//                {
			//                    label: this.oBundle.getText("time"),
			//                    text: s.getCells()[1].getText()
			//                }
			//            ];
			//            var b = new Date();
			//            var S = {
			//                showNote: false,
			//                title: this.oBundle.getText("deleteConfirmation"),
			//                confirmButtonLabel: this.oBundle.getText("OK"),
			//                additionalInformation: a
			//            };
			//            this.openConfirmationPopup(S, "D", s);
			//        }
			//    },
			//    processError: function (e) {
			//        this.oErrorHandler.setShowErrors("immediately");
			//    },
			//    _onOverviewRouteMatched: function () {
			//        var e = this.getOwnerComponent().getModel("changeExchgModel");
			//        if (e && e.getData().reloadList) {
			//            var d = e.getData().loadDate;
			//            this.getEvents(d);
			//        }
			//    },
			//    parseEventsData: function (d) {
			//        var a, b;
			//        for (var i = 0; i < d.length; i++) {
			//            try {
			//                var c = new Date(d[i].EventDate);
			//                var e = new Date(c.getUTCFullYear(), c.getUTCMonth(), c.getUTCDate());
			//                a = e;
			//            } catch (o) {
			//                a = new Date(d[i].EventDate);
			//            }
			//            d[i].EventDate = a;
			//            switch (d[i].Status) {
			//            case "APPROVED":
			//                d[i].statusState = "Success";
			//                break;
			//            case "POSTED":
			//                d[i].statusState = "Success";
			//                break;
			//            case "REJECTED":
			//                d[i].statusState = "Error";
			//                break;
			//            default:
			//                d[i].statusState = "None";
			//                break;
			//            }
			//            b = d[i].EventTime.ms;
			//            d[i].EventTime = this.formatTime(b);
			//            if (!this.configuration.ModifyAllowed) {
			//                d[i].type = "Inactive";
			//            } else {
			//                switch (d[i].Origin) {
			//                case "E":
			//                    d[i].type = "Navigation";
			//                    break;
			//                default:
			//                    d[i].type = "Inactive";
			//                    break;
			//                }
			//            }
			//        }
			//        return d;
			//    },
			//    resetFields: function () {
			//        var a = this;
			//        this.byId("datePicker").setDateValue(new Date());
			//        this.byId("timePicker").setDateValue(new Date());
			//        this.byId("comments").setValue("");
			//        this.byId("approver").setValue(this.configuration.ApproverName);
			//        this.approverIdSelected = this.configuration.ApproverId;
			//        this.byId("idTimeEventType").setSelectedKey(this.configuration.DefaultEvent);
			//        this.onSelectionChange(null, this.configuration.DefaultEvent);
			//        if (!this.setTimeIntervalDetails) {
			//            this.setTimeIntervalDetails = setInterval(function () {
			//                try {
			//                    a.byId("timePicker").setValue(a.timeFormatter.format(new Date()));
			//                } catch (e) {
			//                    jQuery.sap.log.warning("Could not set Time", ["getConfiguration"], ["hcm.myTimeEvents"]);
			//                }
			//            }, 60000);
			//        }
			//    },
			//    getFavorites: function () {
			//        var a = this;
			//        this.byId("favList").setBusy(true);
			//        var b = new sap.ui.model.Filter({
			//            path: "EmployeeID",
			//            operator: sap.ui.model.FilterOperator.EQ,
			//            value1: this.empID
			//        });
			//        var f = [];
			//        f.push(b);
			//        var m = new sap.ui.model.json.JSONModel();
			//        this.oDataModel.read("/FavoritesSet", {
			//            filters: f,
			//            success: function (d, r) {
			//                a.byId("favList").setBusy(false);
			//                var c = d.results;
			//                m.setData(c);
			//                a.setModel(m, "FavoritesSet");
			//            },
			//            error: function (e) {
			//                a.byId("favList").setBusy(false);
			//                a.processError(e);
			//            }
			//        });
			//    },
			//    checkOriginColumnDisplay: function () {
			//        if (this.extHookOriginColumn) {
			//            this.extHookOriginColumn();
			//            this.byId("subSystemColumnId").setVisible(true);
			//        }
			//    },
			//    checkCalendarMarking: function () {
			//        if (this.extHookCalendarMarking) {
			//            this.extHookCalendarMarking();
			//            this.LateCalendarMarking = "true";
			//            this.NoCalendarInit = "true";
			//        }
			//    },
			//    formatTime: function (T) {
			//        if (T) {
			//            var a = T / 1000;
			//            var b = T / 60000;
			//            var h = Math.floor(b / 60).toString();
			//            if (h.length === 1) {
			//                h = "0" + h;
			//            }
			//            var m = Math.floor(b % 60).toFixed(0);
			//            if (m.length === 1) {
			//                m = "0" + m;
			//            }
			//            var s = Math.floor(a % 60).toFixed(0);
			//            if (s.length === 1) {
			//                s = "0" + s;
			//            }
			//            var c = h + ":" + m + ":" + s;
			//            var d = new Date();
			//            d.setHours(h);
			//            d.setMinutes(m);
			//            d.setSeconds(s);
			//            c = this.timeFormatter.format(d);
			//            return c;
			//        }
			//    },
			//    formatTimeString: function (d) {
			//        if (d === null) {
			//            return "PT00H00M00S";
			//        }
			//        var h = d.getHours(), m = d.getMinutes(), s = d.getSeconds();
			//        if (h.length === 1) {
			//            h = "0" + h;
			//        }
			//        if (m.length === 1) {
			//            m = "0" + m;
			//        }
			//        if (s.length === 1) {
			//            s = "0" + s;
			//        }
			//        return "PT" + h + "H" + m + "M" + s + "S";
			//    },
			//    formatTimeDisplay: function (d) {
			//        var h = d.getHours(), m = d.getMinutes(), s = d.getSeconds();
			//        if (h.length === 1) {
			//            h = "0" + h;
			//        }
			//        if (m.length === 1) {
			//            m = "0" + m;
			//        }
			//        if (s.length === 1) {
			//            s = "0" + s;
			//        }
			//        return h + ":" + m + ":" + s;
			//    },
			//    formatDateTimeString: function (d) {
			//        if (typeof d === "string") {
			//            d = new Date(d);
			//        }
			//        var a = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "yyyy-MM-dd" });
			//        var b = a.format(d) + "T00:00:00";
			//        return b;
			//    },
			//    formatDate: function (d) {
			//        var o = sap.ui.core.format.DateFormat.getDateInstance({ style: sap.ui.Device.system.phone ? "short" : "long" });
			//        var a = o.format(d);
			//        return a;
			//    },
			//    formatTimeFromDate: function (d) {
			//        var h = d.getHours(), m = d.getMinutes(), s = d.getSeconds();
			//        if (h.length === 1) {
			//            h = "0" + h;
			//        }
			//        if (m.length === 1) {
			//            m = "0" + m;
			//        }
			//        if (s.length === 1) {
			//            s = "0" + s;
			//        }
			//        return h + ":" + m + ":" + s;
			//    },
			//    formatOrigin: function (o) {
			//        if (o != null) {
			//            this.oBundle = this.getModel("i18n").getResourceBundle();
			//            var a;
			//            switch (o) {
			//            case "":
			//            case "S":
			//                a = this.oBundle.getText("yes");
			//                break;
			//            default:
			//                a = this.oBundle.getText("no");
			//                break;
			//            }
			//            return a;
			//        }
			//    }
		_initEmptyModels: function () {

			var dataSchedule,
				oTableSchedule,
				oTblScheduleModel;

			dataSchedule = {
				ScheduleI: []
			};
			oTableSchedule = this.getView().byId("idScheduleTable");
			oTblScheduleModel = new J(dataSchedule);

			oTableSchedule.setModel(oTblScheduleModel);

			var dataCloture,
				oTableCloture,
				oTblClotureModel;

			dataCloture = {
				Cloture: []
			};

			oTableCloture = this.getView().byId("idClotureTable");
			oTblClotureModel = new J(dataCloture);

			oTableCloture.setModel(oTblClotureModel);

			var dataSchedule2,
				oTableSchedule2,
				oTblScheduleModel2;

			dataSchedule2 = {
				ScheduleI: []
			};
			oTableSchedule2 = this.getView().byId("idScheduleTable2");
			oTblScheduleModel2 = new J(dataSchedule2);

			oTableSchedule2.setModel(oTblScheduleModel2);

			var dataCloture2,
				oTableCloture2,
				oTblClotureModel2;

			dataCloture2 = {
				Cloture: []
			};
			oTableCloture2 = this.getView().byId("idClotureTable2");
			oTblClotureModel2 = new J(dataCloture2);

			oTableCloture2.setModel(oTblClotureModel2);
		},
		_loadData: function () {
			//Load table Cloture
			this._loadTblCloture();
			//Load table schedule
			this._loadTblSchedule();
		},
		_loadTblCloture: function () {
			var data = {
				Cloture: [{
					Description: "Dure de la pause meridienne",
					Schedule: "0:31"
				}, {
					Description: "Dure reelie de travali",
					Schedule: "7:58"
				}, {
					Description: "Dure theorique de travali",
					Schedule: "7:24"
				}, {
					Description: "Credit",
					Schedule: "0:34"
				}]
			};

			var oTable,
				oTblModel;

			oTable = this.getView().byId("idClotureTable");
			oTblModel = new J(data);

			oTable.setModel(oTblModel);

			var oTblModel2 = new J(data);
			var oTableCloture2 = this.getView().byId("idClotureTable2");
			oTableCloture2.setModel(oTblModel2);

		},
		_loadTblSchedule: function () {
			var data = {
				ScheduleI: [{
					From: "00:00",
					To: "07:30",
					Type: "Interdite"
				}, {
					From: "07:30",
					To: "09:31",
					Type: "Variable"
				}, {
					From: "09:31",
					To: "11:16",
					Type: "Obligatoire"
				}, {
					From: "11:16",
					To: "14:16",
					Type: "Pause meridienne"
				}, {
					From: "14:16",
					To: "15:30",
					Type: "Obligatoire"
				}, {
					From: "15:30",
					To: "18:00",
					Type: "Variable"
				}, {
					From: "18:00",
					To: "00:00",
					Type: "Interdite"
				}]
			};

			var oTable,
				oTblModel;

			oTable = this.getView().byId("idScheduleTable");
			oTblModel = new J(data);

			oTable.setModel(oTblModel);

			var oTblModel2 = new J(data);
			var oTableSchedule2 = this.getView().byId("idScheduleTable2");
			oTableSchedule2.setModel(oTblModel2);

		},
		onBtnCreate: function () {
			//Show Detailed Entry Dialog			
			this._showDetEntryDialog();
		},

		_showDetEntryDialog: function () {
			var oView = this.getView();
			var oDialog = oView.byId('detailedEntryDialog');

			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), oDialog);
			oDialog.open();

		},
		onSaveDetEntry: function(oEvent){
			this.onSave(oEvent);
		},
		onCancelDetEntry:function(oEvent){
			oEvent.getSource().getParent().close();
			this.resetFields();
		}
	});
});