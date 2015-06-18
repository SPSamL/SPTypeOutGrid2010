/// <reference path='../../../../TypeScriptMappings/knockout.d.ts' />
/// <reference path='../../../../TypeScriptMappings/moment.d.ts' />

module EditableGrid {

    export class ContractOption {
        public Id: number;
        public OptionNumber: number;
        public StartDate: KnockoutObservable<string>;
        public EndDate: KnockoutObservable<string>;
        public ActiveStatus: KnockoutObservable<string>;
        public OptionType: string;
        public IsDirty: boolean;

        beginEdit(transaction) {
            this.EndDate.beginEdit(transaction);
        }

        toJSON() {
            var copy = ko.toJS(this);
            return copy;
        }

        constructor(data) {
            this.Id = data.Id;
            this.OptionNumber = data.OptionNumber;
            this.StartDate = ko.observable<string>(data.StartDate).extend({ editable: true });;
            this.EndDate = ko.observable<string>(data.EndDate).extend({ editable: true });
            this.ActiveStatus = ko.observable<string>(data.ActiveStatus);
            this.IsDirty = data.IsDirty;
            this.OptionType = data.OptionType;
        }
    }

    export class ContractOptionType {
        static Player = "Player";
        static Team = "Team";
    }
} 