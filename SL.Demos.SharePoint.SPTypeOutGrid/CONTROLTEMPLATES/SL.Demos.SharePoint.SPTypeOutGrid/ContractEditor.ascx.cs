using Microsoft.SharePoint;
using Microsoft.SharePoint.WebControls;
using Newtonsoft.Json;
using SL.Demos.SharePoint.SPTypeOutGrid.Common;
using System;
using System.Collections.Generic;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;

namespace SL.Demos.SharePoint.SPTypeOutGrid.CONTROLTEMPLATES
{
    public partial class ContractEditor : UserControl
    {
        private SPControlMode _FormControlMode;
        public SPControlMode FormContext
        {
            get
            {
                return this._FormControlMode;
            }
            set
            {
                this._FormControlMode = value;
            }
        }
        protected void Page_Load(object sender, EventArgs e)
        {

            SPContext.Current.FormContext.OnSaveHandler += new EventHandler(SaveHandler);
            this.listFieldIterator.ControlMode = FormContext;

            if (!Page.IsPostBack)
            {

            }

            if (SPContext.Current.FormContext.FormMode == SPControlMode.Edit)
            {
            }
        }

        private void SaveHandler(object sender, EventArgs e)
        {
            if (SPContext.Current.FormContext.FormMode == Microsoft.SharePoint.WebControls.SPControlMode.New)
            {
                SPContext.Current.ListItem.Update();
                SaveOptionYears();
            }
        }

        private void SaveOptionYears()
        {
            try
            {
                SPList ContractOptionsList = SPContext.Current.Web.Lists[Constants.ContractOptions.LIST];

                List<JSONContractOption> tpItems = JsonConvert.DeserializeObject<List<JSONContractOption>>(contractOptionChanges.Value);

                foreach (JSONContractOption period in tpItems)
                {
                    if (period.Id == -1)
                    {
                        if (period.ActiveStatus != Constants.ContractOptions.ActiveStatus.ACTIVE)
                            continue;

                        SPListItem newItem = ContractOptionsList.Items.Add();
                        newItem[ContractOptionsList.Fields.GetFieldByInternalName(Constants.ContractOptions.ACTIVE_STATUS).Id] = period.ActiveStatus;
                        newItem[ContractOptionsList.Fields.GetFieldByInternalName(Constants.ContractOptions.END_DATE).Id] = DateTime.Parse(period.EndDate);
                        newItem[ContractOptionsList.Fields.GetFieldByInternalName(Constants.ContractOptions.OPTION_NUMBER).Id] = period.OptionNumber;
                        newItem[ContractOptionsList.Fields.GetFieldByInternalName(Constants.ContractOptions.OPTION_TYPE).Id] = period.OptionType;
                        newItem[ContractOptionsList.Fields.GetFieldByInternalName(Constants.ContractOptions.START_DATE).Id] = DateTime.Parse(period.StartDate);
                        newItem[ContractOptionsList.Fields.GetFieldByInternalName(Constants.ContractOptions.CONTRACT).Id] = SPContext.Current.ListItem.ID;
                        newItem.Update();
                    }
                }
            }
            catch (Exception ex)
            {

            }
        }
    }
}
