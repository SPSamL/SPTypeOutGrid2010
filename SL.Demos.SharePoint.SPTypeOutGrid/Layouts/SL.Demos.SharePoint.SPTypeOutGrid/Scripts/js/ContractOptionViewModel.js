/// <reference path='../../../../TypeScriptMappings/jquery.d.ts' />
/// <reference path='../../../../TypeScriptMappings/knockout.d.ts' />
/// <reference path='../../../../TypeScriptMappings/moment.d.ts' />
/// <reference path='../../../../TypeScriptMappings/SharePoint.d.ts' />
/// <reference path='../../../../TypeScriptMappings/SPServices.d.ts' />
var EditableGrid;
(function (EditableGrid) {
    var ContractOptionViewModel = (function () {
        //#endregion
        //#region ContractOption grids functions and VM constructor
        function ContractOptionViewModel(data, currentFormMode, currentSiteUrl, currentContractId) {
            var _this = this;
            //#region Class-level variables
            //All TimePeriods
            this.contractOptions = ko.observableArray([]);
            //All Option Years, TeamOptions
            this.playerOptions = ko.computed(function () {
                return ko.utils.arrayFilter(_this.contractOptions(), function (item) {
                    return item.OptionType === EditableGrid.ContractOptionType.Player;
                });
            });
            this.teamOptions = ko.computed(function () {
                return ko.utils.arrayFilter(_this.contractOptions(), function (item) {
                    return item.OptionType === EditableGrid.ContractOptionType.Team;
                });
            });
            //Active Option Years, TeamOptions
            this.activePlayerOptions = ko.computed(function () {
                return ko.utils.arrayFilter(_this.playerOptions(), function (item) {
                    return item.ActiveStatus() == 'Active';
                });
            });
            this.activeTeamOptions = ko.computed(function () {
                return ko.utils.arrayFilter(_this.teamOptions(), function (item) {
                    return item.ActiveStatus() == 'Active';
                });
            });
            this.editingItem = ko.observable();
            this.editTransaction = new ko.subscribable();
            this.formMode = currentFormMode;
            this.currentSite = currentSiteUrl;
            this.currentContractId = currentContractId;
            if (!ContractOptionViewModel.isObjectNullorUndefined(data) && data.length > 0) {
                var mappedContractOptions = $.map(data, function (item) {
                    return new EditableGrid.ContractOption(item);
                });
                this.contractOptions(mappedContractOptions);
            }
        }
        ContractOptionViewModel.prototype.isPlayerOptionEditing = function (selectedContractOption) {
            return selectedContractOption === this.editingItem();
        };
        ContractOptionViewModel.prototype.isTeamOptionEditing = function (selectedContractOption) {
            return selectedContractOption === this.editingItem();
        };
        ContractOptionViewModel.prototype.addContractOption = function (optionType) {
            var newStartDate = this.getStartDate(optionType);
            if (newStartDate === "") {
                alert("No Base Year End Date provided.");
                return;
            }
            var newEndDate = this.getDefaultEndDate(newStartDate, optionType);
            var newContractOptionNumber = (optionType == EditableGrid.ContractOptionType.Player ? this.activePlayerOptions().length : this.activeTeamOptions().length) + 1;
            var existingItem = ko.utils.arrayFirst(this.contractOptions(), function (selectedContractOption) {
                return (selectedContractOption.OptionNumber === newContractOptionNumber && selectedContractOption.OptionType === optionType);
            });
            if (this.isValidDateRange(optionType, moment(newStartDate).toDate(), moment(newEndDate).toDate())) {
                if (existingItem && existingItem.Id != null) {
                    existingItem.ActiveStatus('Active');
                    existingItem.StartDate(newStartDate);
                    existingItem.EndDate(newEndDate);
                    existingItem.IsDirty = true;
                    var that = this;
                    if (this.formMode !== "New") {
                        var tempOption = existingItem;
                        this.updateListItem(tempOption, true).then(function (item) {
                            that.onItemUpdated();
                        }, function (sender, args) {
                            that.onQueryFailed(sender, args);
                        });
                    }
                }
                else {
                    this.newOption = new EditableGrid.ContractOption({
                        Id: -1,
                        OptionNumber: newContractOptionNumber,
                        StartDate: newStartDate,
                        EndDate: newEndDate,
                        ActiveStatus: 'Active',
                        IsDirty: true,
                        OptionType: optionType
                    });
                    var that = this;
                    if (this.formMode === "New")
                        this.onNewItemCreated(null);
                    else
                        this.createListItem().then(function () {
                            that.onNewItemCreated(that.oListItem);
                        }, function (sender, args) {
                            that.onQueryFailed(sender, args);
                        });
                }
            }
            else {
                alert("Provided " + optionType + " date range leaves a gap in contract coverage.");
            }
        };
        ContractOptionViewModel.prototype.editContractOption = function (currentContractOption) {
            if (this.editingItem() == null) {
                currentContractOption.beginEdit(this.editTransaction);
                $("input[id='startDateForEdit']").val(currentContractOption.StartDate());
                this.editingItem(currentContractOption);
            }
        };
        ContractOptionViewModel.prototype.saveContractOption = function (currentContractOption) {
            this.editTransaction.notifySubscribers(null, "commit");
            var hasSuccess = ($("input[id='editIsSuccessful']").val() === 'true');
            var that = this;
            if (hasSuccess) {
                if (this.formMode === "New")
                    this.onItemUpdated();
                else {
                    var tempOption = currentContractOption;
                    this.updateListItem(tempOption, false).then(function (item) {
                        that.onItemUpdated();
                    }, function (sender, args) {
                        that.onQueryFailed(sender, args);
                    });
                }
            }
        };
        ContractOptionViewModel.prototype.cancelUpdateContractOption = function (currentContractOption) {
            this.editTransaction.notifySubscribers(null, "rollback");
            this.editingItem(null);
        };
        ContractOptionViewModel.prototype.deleteContractOption = function (currentContractOption) {
            currentContractOption.ActiveStatus('Deleted');
            var that = this;
            if (this.formMode === "New")
                this.onItemDeleted();
            else {
                var tempOption = currentContractOption;
                this.deleteListItem(tempOption).then(function (item) {
                    that.onItemUpdated();
                }, function (sender, args) {
                    that.onQueryFailed(sender, args);
                });
            }
        };
        //#endregion
        //#region ContractOption grid functions
        ContractOptionViewModel.prototype.addPlayerOption = function () {
            this.addContractOption(EditableGrid.ContractOptionType.Player);
        };
        //#endregion
        //#region TeamOption grid functions
        ContractOptionViewModel.prototype.addTeamOption = function () {
            this.addContractOption(EditableGrid.ContractOptionType.Team);
        };
        //#endregion
        //#region Helper functions
        ContractOptionViewModel.prototype.getStartDate = function (optionType) {
            var returnDate;
            var baseEndDate;
            var lastPlayerOptionEndDate;
            var lastTeamOptionEndDate;
            var contractEndDate = jQuery("input[title='ContractEndDate']").val();
            if (contractEndDate && contractEndDate.length > 0 && moment(contractEndDate).isValid()) {
                baseEndDate = moment(contractEndDate).toDate();
            }
            else {
                return "";
            }
            //Gets the last end data for player options
            if (this.activePlayerOptions() && this.activePlayerOptions().length > 0) {
                ko.utils.arrayForEach(this.activePlayerOptions(), function (selectedContractOption) {
                    if (ContractOptionViewModel.isObjectNullorUndefined(lastPlayerOptionEndDate) || moment(lastPlayerOptionEndDate) < moment(selectedContractOption.EndDate()))
                        lastPlayerOptionEndDate = moment(selectedContractOption.EndDate()).toDate();
                });
            }
            //Gets the last end data for TeamOptions
            if (this.activeTeamOptions() && this.activeTeamOptions().length > 0) {
                ko.utils.arrayForEach(this.activeTeamOptions(), function (selectedContractOption) {
                    if (ContractOptionViewModel.isObjectNullorUndefined(lastTeamOptionEndDate) || moment(lastTeamOptionEndDate) < moment(selectedContractOption.EndDate()))
                        lastTeamOptionEndDate = moment(selectedContractOption.EndDate()).toDate();
                });
            }
            //if there are existing, active player options, use the last Player Option end date, else use the base end date
            if (optionType === EditableGrid.ContractOptionType.Player && !ContractOptionViewModel.isObjectNullorUndefined(lastPlayerOptionEndDate) && moment(lastPlayerOptionEndDate).isValid())
                returnDate = lastPlayerOptionEndDate;
            else
                returnDate = baseEndDate;
            //if existing, active TeamOptions, use last TeamOption end date; else if existing, active Option Years; else base end date
            if (optionType === EditableGrid.ContractOptionType.Team) {
                if (!ContractOptionViewModel.isObjectNullorUndefined(lastTeamOptionEndDate) && moment(lastTeamOptionEndDate).isValid())
                    returnDate = lastTeamOptionEndDate;
                else if (!ContractOptionViewModel.isObjectNullorUndefined(lastPlayerOptionEndDate) && moment(lastPlayerOptionEndDate).isValid())
                    returnDate = lastPlayerOptionEndDate;
                else
                    returnDate = baseEndDate;
            }
            //adds the day and formats to string
            return moment(returnDate).add("days", 1).format("M/D/YYYY");
        };
        ContractOptionViewModel.prototype.getDefaultEndDate = function (startDate, optionType) {
            //if (optionType === EditableGrid.ContractOptionType.Player)
            return moment(startDate).add("years", 1).subtract(1, "days").format("M/D/YYYY");
            //else
            //    return moment(startDate).add("months", 6).subtract(1, "days").format("M/D/YYYY");
        };
        ContractOptionViewModel.prototype.saveArrayToHidden = function () {
            if (jQuery("input[id$='contractOptionChanges']"))
                jQuery("input[id$='contractOptionChanges']").val(ko.toJSON(this.contractOptions(), null, null));
            else
                alert("Failed to save changes.");
        };
        ContractOptionViewModel.prototype.isValidDateRange = function (optionType, newStartDate, newEndDate) {
            var activeOYCount = this.activePlayerOptions().length;
            var activeExtCount = this.activeTeamOptions().length;
            var baseEndDate;
            var contractEndDate = jQuery("input[title='ContractEndDate']").val();
            if (contractEndDate && contractEndDate.length > 0 && moment(contractEndDate).isValid()) {
                baseEndDate = moment(contractEndDate).toDate();
            }
            var baseCompare = moment(baseEndDate).add("days", 1);
            //Option Year validation
            if (optionType === EditableGrid.ContractOptionType.Player) {
                if (activeOYCount > 0) {
                    var latestContractOption = moment(this.activePlayerOptions()[activeOYCount - 1].EndDate()).add("days", 1);
                    if (latestContractOption.isSame(newStartDate)) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                else {
                    if (baseCompare.isSame(newStartDate)) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
            }
            else {
                if (activeExtCount > 0) {
                    var latestTeamOption = moment(this.activeTeamOptions()[activeExtCount - 1].EndDate()).add("days", 1);
                    if (latestTeamOption.isSame(newStartDate)) {
                        return true;
                    }
                }
                else if (activeOYCount > 0) {
                    var latestContractOption = moment(this.activePlayerOptions()[activeOYCount - 1].EndDate()).add("days", 1);
                    if (latestContractOption.isSame(newStartDate)) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                else {
                    if (baseCompare.isSame(newStartDate)) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
            }
        };
        ContractOptionViewModel.isObjectNullorUndefined = function (object) {
            if (object == null || object == undefined)
                return true;
            else
                return false;
        };
        ContractOptionViewModel.prototype.createListItem = function () {
            var deferred = $.Deferred();
            var clientContext = new SP.ClientContext(this.currentSite);
            var oList = clientContext.get_web().get_lists().getByTitle('Options');
            var itemCreateInfo = new SP.ListItemCreationInformation();
            this.oListItem = oList.addItem(itemCreateInfo);
            this.oListItem.set_item('OptionNumber', this.newOption.OptionNumber);
            this.oListItem.set_item('StartDate', this.newOption.StartDate());
            this.oListItem.set_item('_EndDate', this.newOption.EndDate());
            this.oListItem.set_item('ActiveStatus', this.newOption.ActiveStatus());
            this.oListItem.set_item('OptionType', this.newOption.OptionType);
            this.oListItem.set_item('Contract', this.currentContractId);
            this.oListItem.update();
            clientContext.load(this.oListItem);
            clientContext.executeQueryAsync(Function.createDelegate(this, function () {
                deferred.resolve(this.oListItem);
            }), Function.createDelegate(this, function (sender, args) {
                deferred.reject(sender, args);
            }));
            return deferred.promise();
        };
        ContractOptionViewModel.prototype.deleteListItem = function (tempItem) {
            var deferred = $.Deferred();
            var clientContext = new SP.ClientContext(this.currentSite);
            var oList = clientContext.get_web().get_lists().getByTitle('Options');
            var oListItem = oList.getItemById(tempItem.Id);
            oListItem.set_item('ActiveStatus', tempItem.ActiveStatus());
            oListItem.update();
            clientContext.executeQueryAsync(Function.createDelegate(this, function () {
                deferred.resolve(this.updateItem);
            }), Function.createDelegate(this, function (sender, args) {
                deferred.reject(sender, args);
            }));
            return deferred.promise();
        };
        ContractOptionViewModel.prototype.updateListItem = function (tempItem, isUpdatedFromAdd) {
            var deferred = $.Deferred();
            var clientContext = new SP.ClientContext(this.currentSite);
            var oList = clientContext.get_web().get_lists().getByTitle('Options');
            this.updateItem = oList.getItemById(tempItem.Id);
            this.updateItem.set_item('_EndDate', tempItem.EndDate());
            this.updateItem.set_item('OptionNumber', tempItem.OptionNumber);
            this.updateItem.set_item('OptionType', tempItem.OptionType);
            this.updateItem.set_item('StartDate', tempItem.StartDate());
            this.updateItem.set_item('ActiveStatus', tempItem.ActiveStatus());
            this.updateItem.update();
            clientContext.executeQueryAsync(Function.createDelegate(this, function () {
                deferred.resolve(this.updateItem);
            }), Function.createDelegate(this, function (sender, args) {
                deferred.reject(sender, args);
            }));
            return deferred.promise();
        };
        ContractOptionViewModel.prototype.UpdateNewItemID = function () {
            var clientContext = new SP.ClientContext(this.currentSite);
            var oList = clientContext.get_web().get_lists().getByTitle('Options');
            var camlQuery = new SP.CamlQuery();
            camlQuery.set_viewXml("<View>" + "<Query>" + "< Where >" + "<And>" + "<And>" + "<Eq>" + "<FieldRef Name='Contract' LookupId= 'True' />" + "<Value Type='Lookup' >" + this.currentContractId + "< /Value>" + "< /Eq>" + "< Eq >" + "<FieldRef Name='OptionNumber' />" + "<Value Type='Number' >" + this.newOption.OptionNumber + "< /Value>" + "< /Eq>" + "< /And>" + "<Eq>" + "<FieldRef Name='OptionType' />" + "<Value Type='Choice' >" + this.newOption.OptionType + "< /Value>" + "</Eq>" + "</And>" + "< /Where>" + "</Query>" + "<ViewFields>" + "<FieldRef Name='ActiveStatus' />" + "<FieldRef Name='Contract' />" + "<FieldRef Name='_EndDate' />" + "<FieldRef Name='OptionType' />" + "<FieldRef Name='OptionNumber' />" + "<FieldRef Name='StartDate' />" + "</ViewFields>" + "</View>");
            this.newItemCollection = oList.getItems(camlQuery);
            clientContext.load(this.newItemCollection);
            clientContext.executeQueryAsync(Function.createDelegate(this, this.onNewItemCreated), Function.createDelegate(this, this.onQueryFailed));
        };
        ContractOptionViewModel.prototype.onNewItemCreated = function (newItem) {
            //var first: SP.ListItem = this.newItemCollection.get_item(0);
            if (newItem != null)
                this.newOption.Id = newItem.get_id();
            this.contractOptions.push(this.newOption);
            if (this.formMode == "New")
                this.saveArrayToHidden();
        };
        ContractOptionViewModel.prototype.onItemUpdated = function () {
            this.editingItem(null);
            if (this.formMode == "New")
                this.saveArrayToHidden();
        };
        ContractOptionViewModel.prototype.onItemDeleted = function () {
            if (this.formMode == "New")
                this.saveArrayToHidden();
        };
        ContractOptionViewModel.prototype.onQueryFailed = function (sender, args) {
            alert('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
        };
        return ContractOptionViewModel;
    })();
    EditableGrid.ContractOptionViewModel = ContractOptionViewModel;
})(EditableGrid || (EditableGrid = {}));
//# sourceMappingURL=ContractOptionViewModel.js.map