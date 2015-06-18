using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace SL.Demos.SharePoint.SPTypeOutGrid.Common
{
    public static class Constants
    {
        public static class ContractOptions
        {
            public const string LIST = "Options";
            public const string CONTRACT = "Contract";
            public const string OPTION_NUMBER = "OptionNumber";
            public const string START_DATE = "StartDate";
            public const string END_DATE = "_EndDate";
            public const string OPTION_TYPE = "OptionType";
            public const string ACTIVE_STATUS = "ActiveStatus";

            public static class ActiveStatus
            {
                public const string ACTIVE = "Active";
                public const string DELETED = "Deleted";
            }
        }

        public static class Contract
        {
            public const string LIST = "Contracts";
            public const string CONTRACT_START = "ContractStartDate";
            public const string CONTRACT_END = "ContractEndDate";
            public const string CONTRACT_PLAYER = "Player";
            public const string CONTRACT_AGENT = "Agent";
            public const string CONTRACT_TEAM = "Team";
        }
    }
}
