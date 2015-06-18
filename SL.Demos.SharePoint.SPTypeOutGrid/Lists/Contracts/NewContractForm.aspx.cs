using System;
using Microsoft.SharePoint;
using Microsoft.SharePoint.WebControls;
using Microsoft.SharePoint.WebPartPages;
using SL.Demos.SharePoint.SPTypeOutGrid.CONTROLTEMPLATES;

namespace SL.Demos.SharePoint.SPTypeOutGrid.Lists
{
    public partial class NewContractForm : WebPartPage
    {
        protected void Page_Load(object sender, EventArgs e)
        {
        }

        protected override void CreateChildControls()
        {
            base.CreateChildControls();
            ContractEditor contractEditorControl = Page.LoadControl(@"/_CONTROLTEMPLATES/SL.Demos.SharePoint.SPTypeOutGrid/ContractEditor.ascx") as ContractEditor;
            contractEditorControl.ID = "contractEditorControl";
            contractEditorControl.FormContext = SPControlMode.New;
            ContractControlPlaceHolder.Controls.Add(contractEditorControl);
        }
    }
}
