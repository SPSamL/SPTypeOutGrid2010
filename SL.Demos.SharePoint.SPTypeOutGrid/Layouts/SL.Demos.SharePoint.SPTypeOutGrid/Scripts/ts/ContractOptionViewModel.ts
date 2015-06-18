/// <reference path='../../../../TypeScriptMappings/jquery.d.ts' />
/// <reference path='../../../../TypeScriptMappings/knockout.d.ts' />
/// <reference path='../../../../TypeScriptMappings/moment.d.ts' />
/// <reference path='../../../../TypeScriptMappings/SharePoint.d.ts' />

module EditableGrid {

    export class ContractOptionViewModel {
        //#region Class-level variables
        //All TimePeriods
        private contractOptions: KnockoutObservableArray<ContractOption> = ko.observableArray([]);

        //All Option Years, TeamOptions
        public playerOptions = ko.computed(() => {
            return ko.utils.arrayFilter(this.contractOptions(), function (item: ContractOption) {
                return item.OptionType === EditableGrid.ContractOptionType.Player;
            });
        });
        public teamOptions = ko.computed(() => {
            return ko.utils.arrayFilter(this.contractOptions(), function (item: ContractOption) {
                return item.OptionType === EditableGrid.ContractOptionType.Team;
            });
        });

        //Active Option Years, TeamOptions
        public activePlayerOptions = ko.computed(() => {
            return ko.utils.arrayFilter(this.playerOptions(), function (item: ContractOption) {
                return item.ActiveStatus() == 'Active';
            });
        });
        public activeTeamOptions = ko.computed(() => {
            return ko.utils.arrayFilter(this.teamOptions(), function (item: ContractOption) {
                return item.ActiveStatus() == 'Active';
            });
        });

        public editingItem: KnockoutObservable<ContractOption> = ko.observable<ContractOption>();

        public editTransaction = new ko.subscribable();

        public formMode: string;

        private currentSite: string;

        private oListItem: SP.ListItem;
        private currentContractId: number;
        private newOption: EditableGrid.ContractOption;

        //#endregion

        //#region ContractOption grids functions and VM constructor
        constructor(data, currentFormMode, currentSiteUrl, currentContractId) {
            this.formMode = currentFormMode;
            this.currentSite = currentSiteUrl;
            this.currentContractId = currentContractId;

            if (!ContractOptionViewModel.isObjectNullorUndefined(data) && data.length > 0) {
                var mappedContractOptions = $.map(data, function (item) {
                    return new ContractOption(item);
                });

                this.contractOptions(mappedContractOptions);
            }
        }

        isPlayerOptionEditing(selectedContractOption: ContractOption): boolean {
            return selectedContractOption === this.editingItem();
        }

        isTeamOptionEditing(selectedContractOption: ContractOption): boolean {
            return selectedContractOption === this.editingItem();
        }

        addContractOption(optionType: string) {
            var newStartDate: string = this.getStartDate(optionType);

            if (newStartDate === "") {
                alert("No Base Year End Date provided.");
                return;
            }

            var newEndDate: string = this.getDefaultEndDate(newStartDate, optionType);

            var newContractOptionNumber: number = (optionType == EditableGrid.ContractOptionType.Player ? this.activePlayerOptions().length : this.activeTeamOptions().length) + 1;

            var existingItem: ContractOption = ko.utils.arrayFirst(this.contractOptions(), function (selectedContractOption: ContractOption) {
                return (selectedContractOption.OptionNumber === newContractOptionNumber && selectedContractOption.OptionType === optionType);

            });

            if (this.isValidDateRange(optionType, moment(newStartDate).toDate(), moment(newEndDate).toDate())) {
                if (existingItem && existingItem.Id != null) {
                    existingItem.ActiveStatus('Active');
                    existingItem.StartDate(newStartDate);
                    existingItem.EndDate(newEndDate);
                    existingItem.IsDirty = true;

                    if (this.formMode !== "New") {
                        var tempOption = existingItem;
                        this.updateListItem(tempOption, true);
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

                    if (this.formMode === "New")
                        this.onNewItemCreated();
                    else
                        this.createListItem();
                }
            }
            else {
                alert("Provided " + optionType + " date range leaves a gap in contract coverage.");
            }
        }

        editContractOption(currentContractOption: ContractOption) {
            if (this.editingItem() == null) {
                currentContractOption.beginEdit(this.editTransaction);
                $("input[id='startDateForEdit']").val(currentContractOption.StartDate());
                this.editingItem(currentContractOption);
            }
        }

        saveContractOption(currentContractOption: ContractOption) {
            this.editTransaction.notifySubscribers(null, "commit");

            var hasSuccess = ($("input[id='editIsSuccessful']").val() === 'true');


            if (hasSuccess) {
                if (this.formMode === "New")
                    this.onItemUpdated();
                else {
                    var tempOption = currentContractOption;
                    this.updateListItem(tempOption, false);
                }
            }
        }

        cancelUpdateContractOption(currentContractOption: ContractOption) {
            this.editTransaction.notifySubscribers(null, "rollback");

            this.editingItem(null);
        }

        deleteContractOption(currentContractOption: ContractOption) {
            currentContractOption.ActiveStatus('Deleted');

            if (this.formMode === "New")
                this.onItemDeleted();
            else {
                var tempOption = currentContractOption;
                this.deleteListItem(tempOption);
            }
        }
        //#endregion

        //#region ContractOption grid functions
        addPlayerOption() {
            this.addContractOption(EditableGrid.ContractOptionType.Player);
        }
        //#endregion

        //#region TeamOption grid functions
        addTeamOption() {
            this.addContractOption(EditableGrid.ContractOptionType.Team);
        }
        //#endregion

        //#region Helper functions
        private getStartDate(optionType: string): string {
            var returnDate: Date;
            var baseEndDate: Date;
            var lastPlayerOptionEndDate: Date;
            var lastTeamOptionEndDate: Date;

            var contractEndDate: string = jQuery("input[title='ContractEndDate Required Field']").val();
            if (contractEndDate && contractEndDate.length > 0 && moment(contractEndDate).isValid()) {
                baseEndDate = moment(contractEndDate).toDate();
            }
            else {
                return "";
            }

            //Gets the last end data for player options
            if (this.activePlayerOptions() && this.activePlayerOptions().length > 0) {
                ko.utils.arrayForEach(this.activePlayerOptions(), function (selectedContractOption: ContractOption) {
                    if (ContractOptionViewModel.isObjectNullorUndefined(lastPlayerOptionEndDate) || moment(lastPlayerOptionEndDate) < moment(selectedContractOption.EndDate()))
                        lastPlayerOptionEndDate = moment(selectedContractOption.EndDate()).toDate();
                });
            }

            //Gets the last end data for TeamOptions
            if (this.activeTeamOptions() && this.activeTeamOptions().length > 0) {
                ko.utils.arrayForEach(this.activeTeamOptions(), function (selectedContractOption: ContractOption) {
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
        }

        private getDefaultEndDate(startDate: string, optionType: string): string {
            //if (optionType === EditableGrid.ContractOptionType.Player)
                return moment(startDate).add("years", 1).subtract(1, "days").format("M/D/YYYY");
            //else
            //    return moment(startDate).add("months", 6).subtract(1, "days").format("M/D/YYYY");
        }

        private saveArrayToHidden() {
            if (jQuery("input[id$='contractOptionChanges']"))
                jQuery("input[id$='contractOptionChanges']").val(ko.toJSON(this.contractOptions(), null, null));
            else
                alert("Failed to save changes.");
        }

        private isValidDateRange(optionType: string, newStartDate: Date, newEndDate: Date): boolean {
            var activeOYCount = this.activePlayerOptions().length;
            var activeExtCount = this.activeTeamOptions().length;
            var baseEndDate: Date;

            var contractEndDate: string = jQuery("input[title='ContractEndDate Required Field']").val();
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
            //TeamOption validation
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
        }

        public static isObjectNullorUndefined(object: Object): boolean {
            if (object == null || object == undefined)
                return true;
            else
                return false;
        }

        private createListItem() {

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

            clientContext.executeQueryAsync(Function.createDelegate(this, this.onNewItemCreated), Function.createDelegate(this, this.onQueryFailed));
        }

        private deleteListItem(tempItem: EditableGrid.ContractOption) {
            var clientContext = new SP.ClientContext(this.currentSite);
            var oList = clientContext.get_web().get_lists().getByTitle('Options');

            this.oListItem = oList.getItemById(tempItem.Id);
            this.oListItem.set_item('ActiveStatus', tempItem.ActiveStatus());
            this.oListItem.update();

            clientContext.executeQueryAsync(Function.createDelegate(this, this.onItemUpdated), Function.createDelegate(this, this.onQueryFailed));
        }

        private updateListItem(tempItem: EditableGrid.ContractOption, isUpdatedFromAdd: boolean) {
            var clientContext = new SP.ClientContext(this.currentSite);
            var oList = clientContext.get_web().get_lists().getByTitle('Options');

            this.oListItem = oList.getItemById(tempItem.Id);

            if (isUpdatedFromAdd || tempItem.EndDate() !== this.editingItem().EndDate())
                this.oListItem.set_item('_EndDate', moment(tempItem.EndDate()));

            if (isUpdatedFromAdd || tempItem.OptionNumber !== this.editingItem().OptionNumber)
                this.oListItem.set_item('OptionNumber', tempItem.OptionNumber);

            if (isUpdatedFromAdd || tempItem.OptionType !== this.editingItem().OptionType)
                this.oListItem.set_item('OptionType', tempItem.OptionType);

            if (isUpdatedFromAdd || tempItem.StartDate() !== this.editingItem().StartDate())
                this.oListItem.set_item('StartDate', moment(tempItem.StartDate()));

            if (isUpdatedFromAdd || tempItem.ActiveStatus() !== this.editingItem().ActiveStatus())
                this.oListItem.set_item('ActiveStatus', tempItem.ActiveStatus());

            this.oListItem.update();

            clientContext.executeQueryAsync(Function.createDelegate(this, this.onItemUpdated), Function.createDelegate(this, this.onQueryFailed));
        }

        private onNewItemCreated() {

            this.contractOptions.push(this.newOption);

            if(this.formMode == "New")
                this.saveArrayToHidden();
        }

        private onItemUpdated() {
            this.editingItem(null);

            if (this.formMode == "New")
                this.saveArrayToHidden();
        }

        private onItemDeleted() {
            if(this.formMode == "New")
                this.saveArrayToHidden();
        }

        private onQueryFailed(sender, args) {

            alert('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
        }
        //#endregion
    }
}  