/// <reference path='../../../../TypeScriptMappings/knockout.d.ts' />
/// <reference path='../../../../TypeScriptMappings/moment.d.ts' />
var EditableGrid;
(function (EditableGrid) {
    var ContractOption = (function () {
        function ContractOption(data) {
            this.Id = data.Id;
            this.OptionNumber = data.OptionNumber;
            this.StartDate = ko.observable(data.StartDate).extend({ editable: true });
            ;
            this.EndDate = ko.observable(data.EndDate).extend({ editable: true });
            this.ActiveStatus = ko.observable(data.ActiveStatus);
            this.IsDirty = data.IsDirty;
            this.OptionType = data.OptionType;
        }
        ContractOption.prototype.beginEdit = function (transaction) {
            this.EndDate.beginEdit(transaction);
        };
        ContractOption.prototype.toJSON = function () {
            var copy = ko.toJS(this);
            return copy;
        };
        return ContractOption;
    })();
    EditableGrid.ContractOption = ContractOption;
    var ContractOptionType = (function () {
        function ContractOptionType() {
        }
        ContractOptionType.Player = "Player";
        ContractOptionType.Team = "Team";
        return ContractOptionType;
    })();
    EditableGrid.ContractOptionType = ContractOptionType;
})(EditableGrid || (EditableGrid = {}));
//# sourceMappingURL=ContractOption.js.map