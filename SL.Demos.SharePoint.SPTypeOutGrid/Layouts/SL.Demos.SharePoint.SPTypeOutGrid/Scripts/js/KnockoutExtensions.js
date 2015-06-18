/// <reference path='../../../../TypeScriptMappings/knockout.d.ts' />
/// <reference path='../../../../TypeScriptMappings/EditableGrid.d.ts' />
/// <reference path='../../../../TypeScriptMappings/jquery.d.ts' />
ko.extenders.editable = function (target, option) {
    if ($.isArray(target()))
        target.editValue = ko.observableArray(target().slice());
    else
        target.editValue = ko.observable(target());
};
ko.observable.fn.beginEdit = function (transaction) {
    var self = this;
    var commitSubscription, rollbackSubscription;
    self.dispose = function () {
        // kill this subscriptions
        commitSubscription.dispose();
        rollbackSubscription.dispose();
    };
    self.commit = function () {
        // update the actual value with the edit value
        // if uses strict MomentJS parsing for / & - delimited formats common in the US and Allied Countries
        var dateFormats = ['M/D/YY', 'M-D-YY', 'MM/DD/YYYY', 'MM-DD-YYYY', 'M/D/YYYY', 'M-D-YYYY', 'YYYY/MM/DD', 'YYYY-MM-DD', 'YY/M/D', 'YY-M-D', 'DD/MM/YYYY', 'DD-MM-YYYY', 'D/M/YYYY', 'D-M-YYYY', 'D/M/YY', 'D-M-YY', 'D/M/YYYY', 'D-M-YYYY'];
        if (moment(self.editValue(), dateFormats, true).isValid()) {
            var startDate = $("input[id='startDateForEdit']").val();
            if (startDate != null && startDate != undefined) {
                if (moment(startDate) < moment(self.editValue())) {
                    self(self.editValue());
                    // dispose the subscriptions
                    self.dispose();
                    $("input[id='editIsSuccessful']").val('true');
                }
                else {
                    alert("The End Date is the same as, or earlier, than the Start Date.  Please provide a later End Date.");
                    $("input[id='editIsSuccessful']").val('false');
                }
            }
        }
        else {
            alert("The End Date is not a valid date. The proper format is: MM/DD/YYYY.");
            $("input[id='editIsSuccessful']").val('false');
        }
    };
    self.rollback = function () {
        // rollback the edit value
        self.editValue(self());
        // dispose the subscriptions
        self.dispose();
    };
    //  subscribe to the transation commit and reject calls
    commitSubscription = transaction.subscribe(self.commit, self, "commit");
    rollbackSubscription = transaction.subscribe(self.rollback, self, "rollback");
    return self;
};
//# sourceMappingURL=KnockoutExtensions.js.map