<%@ Assembly Name="$SharePoint.Project.AssemblyFullName$" %>
<%@ Assembly Name="Microsoft.Web.CommandUI, Version=14.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=14.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="Utilities" Namespace="Microsoft.SharePoint.Utilities" Assembly="Microsoft.SharePoint, Version=14.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="asp" Namespace="System.Web.UI" Assembly="System.Web.Extensions, Version=3.5.0.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35" %>
<%@ Import Namespace="Microsoft.SharePoint" %>
<%@ Register TagPrefix="WebPartPages" Namespace="Microsoft.SharePoint.WebPartPages" Assembly="Microsoft.SharePoint, Version=14.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Control Language="C#" AutoEventWireup="true" CodeBehind="ContractEditor.ascx.cs" Inherits="SL.Demos.SharePoint.SPTypeOutGrid.CONTROLTEMPLATES.ContractEditor" %>

<SharePoint:ScriptLink Language="javascript" Name="SL.Demos.SharePoint.SPTypeOutGrid/Scripts/js/jquery-1.8.3.js" runat="server" Localizable="false" />
<SharePoint:ScriptLink Language="javascript" Name="SL.Demos.SharePoint.SPTypeOutGrid/Scripts/js/knockout-3.3.0.debug.js" runat="server" Localizable="false" />
<SharePoint:ScriptLink Language="javascript" Name="SL.Demos.SharePoint.SPTypeOutGrid/Scripts/js/moment.js" runat="server" Localizable="false" />
<SharePoint:ScriptLink Language="javascript" Name="SL.Demos.SharePoint.SPTypeOutGrid/Scripts/js/KnockoutExtensions.js" runat="server" Localizable="false" />
<SharePoint:ScriptLink Language="javascript" Name="SL.Demos.SharePoint.SPTypeOutGrid/Scripts/js/ContractOption.js" runat="server" Localizable="false" />
<SharePoint:ScriptLink Language="javascript" Name="SL.Demos.SharePoint.SPTypeOutGrid/Scripts/js/ContractOptionViewModel.js" runat="server" Localizable="false" />
<SharePoint:ScriptLink Language="javascript" Name="SL.Demos.SharePoint.SPTypeOutGrid/Scripts/js/app.js" runat="server" Localizable="false" />

<!-- NOTE: the following line is important for attachments because SP will automatically 
           hide the "part1" span when Add Attachments is clicked. -->
<span id="part1">
    <table border="0" cellspacing="0" width="100%">
        <SharePoint:ListFieldIterator ID="listFieldIterator" runat="server" ControlMode="New" />

        <tr>
            <td style="vertical-align: top">Player and Team Option(s)</td>
            <td>
                <h3>Player Options</h3>
                <div id="optionExtensionGrids" style="visibility: hidden">
                    <div>
                        <table class="optionGrid">
                            <thead>
                                <tr>
                                    <th>Action
                                    </th>
                                    <th>Option #
                                    </th>
                                    <th>Start Date
                                    </th>
                                    <th>End Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody data-bind="foreach: { data: activePlayerOptions, as: 'option' }">
                                <tr>
                                    <td>
                                        <div data-bind="if: ((option.OptionNumber == $root.activePlayerOptions().length) && $root.activeTeamOptions().length == 0 && ($root.formMode != 'Display'))">
                                            <a href="#" data-bind="click: $root.editContractOption.bind($root), visible: !$root.isPlayerOptionEditing(option)">Edit</a>
                                            <a href="#" data-bind="click: $root.deleteContractOption.bind($root), visible: !$root.isPlayerOptionEditing(option)">Delete</a>
                                            <a href="#" data-bind="click: $root.saveContractOption.bind($root), visible: $root.isPlayerOptionEditing(option)">Update</a>
                                            <a href="#" data-bind="click: $root.cancelUpdateContractOption.bind($root), visible: $root.isPlayerOptionEditing(option)">Cancel</a>
                                        </div>
                                    </td>
                                    <td>
                                        <label data-bind="text: option.OptionNumber" />
                                    </td>
                                    <td>
                                        <label data-bind="text: option.StartDate" />
                                    </td>
                                    <td>
                                        <input type="text" class="editOptionEndDate" data-bind="value: option.EndDate.editValue, visible: $root.isPlayerOptionEditing(option)" />
                                        <label data-bind="text: option.EndDate, visible: !$root.isPlayerOptionEditing(option)" />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <button data-bind="click: $root.addPlayerOption, visible: ($root.activeTeamOptions().length == 0 && $root.formMode != 'Display')">Add Player Option</button>
                    </div>

                    <div>
                        <h3>Team Options</h3>
                        <table class="optionGrid">
                            <thead>
                                <tr>
                                    <th>Action
                                    </th>
                                    <th>Option #
                                    </th>
                                    <th>Start Date
                                    </th>
                                    <th>End Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody data-bind="foreach: activeTeamOptions">
                                <tr>
                                    <td>
                                        <div data-bind="if: (OptionNumber == $root.activeTeamOptions().length && ($root.formMode != 'Display'))">
                                            <a href="#" data-bind="click: $root.editContractOption.bind($root), visible: !$root.isTeamOptionEditing($data)">Edit</a>
                                            <a href="#" data-bind="click: $root.deleteContractOption.bind($root), visible: !$root.isTeamOptionEditing($data)">Delete</a>
                                            <a href="#" data-bind="click: $root.saveContractOption.bind($root), visible: $root.isTeamOptionEditing($data)">Update</a>
                                            <a href="#" data-bind="click: $root.cancelUpdateContractOption.bind($root), visible: $root.isTeamOptionEditing($data)">Cancel</a>
                                        </div>
                                    </td>
                                    <td>
                                        <label data-bind="text: OptionNumber" />
                                    </td>
                                    <td>
                                        <label data-bind="text: StartDate" />
                                    </td>
                                    <td>
                                        <input type="text" class="editOptionEndDate" data-bind="value: EndDate.editValue, visible: $root.isTeamOptionEditing($data)" />
                                        <label data-bind="text: EndDate, visible: !$root.isTeamOptionEditing($data)" />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <button data-bind="click: $root.addTeamOption, visible: ($root.formMode != 'Display')">Add Team Option</button>
                    </div>
                    <input type="hidden" runat="server" id="contractOptionChanges" />
                    <input type="hidden" id="editIsSuccessful" />
                    <input type="hidden" id="startDateForEdit" />
                </div>
            </td>
        </tr>
        <!-- Attachments -->
        <tr id="idAttachmentsRow">
            <td nowrap="true" valign="top" class="ms-formlabel" width="20%">
                <SharePoint:FieldLabel ID="FieldLabel1" ControlMode="New" FieldName="Attachments" runat="server" />
            </td>
            <td valign="top" class="ms-formbody" width="80%">
                <SharePoint:FormField runat="server" ID="AttachmentsField" ControlMode="New" FieldName="Attachments" />
                <script language="javascript" type="text/javascript">
                    var elm = document.getElementById("idAttachmentsTable");
                    if (elm == null || elm.rows.length == 0)
                        document.getElementById("idAttachmentsRow").style.display = 'none';
                </script>
            </td>
        </tr>
    </table>
    <br />
    <br />
    <table width="100%" border="0" cellspacing="0">
        <!-- "Save" and "Cancel" buttons -->
        <tr>
            <td width="99%" class="ms-toolbar" nowrap="nowrap">
                <img src="/_layouts/images/blank.gif" width="1" height="18" />
            </td>
            <td class="ms-toolbar" nowrap="nowrap">
                <SharePoint:SaveButton runat="server" ControlMode="New" ID="savebutton" />
            </td>
            <td class="ms-separator"></td>
            <td class="ms-toolbar" nowrap="nowrap" align="right">
                <SharePoint:GoBackButton runat="server" ControlMode="New" ID="gobackbutton" />
            </td>
        </tr>
    </table>
</span>
<!-- part1 -->
</span>
<!-- spanNewResponseArea -->

<SharePoint:AttachmentUpload ID="AttachmentUpload1" runat="server" ControlMode="New" />
<SharePoint:ItemHiddenVersion ID="ItemHiddenVersion1" runat="server" ControlMode="New" />

<!-- This is the table to display if the user tried to create a Response directly -->
<table runat="server" id="tableNoIssuance" width="100%" border="0" cellspacing="0" visible="false">
    <tr>
        <td colspan="2">Cannot create a new Response directly. 
      <br />
            You must first select an Issuance and add a Response to it.
      <br />
            <br />
        </td>
    </tr>
    <tr>
        <td width="99%" class="ms-toolbar" nowrap="nowrap">
            <img src="/_layouts/images/blank.gif" width="1" height="18" />
        </td>
        <td class="ms-toolbar" nowrap="nowrap" align="right">
            <SharePoint:GoBackButton runat="server" ControlMode="New" ID="gobackbutton1" />
        </td>
    </tr>
</table>
<script type="text/javascript">
    var siteUrl = '/sites/demo';
    var currentContractId;
    var currentFormMode = "<%= this.FormContext.ToString() %>";

    function retrieveListItems() {
        var clientContext = new SP.ClientContext(siteUrl);
        var oList = clientContext.get_web().get_lists().getByTitle('Options');

        var camlQuery = new SP.CamlQuery();
        camlQuery.set_viewXml("<View>" +
            "<Query>" +
                "<Where>" +
                    "<Eq>" +
                        "<FieldRef Name='Contract' LookupId='True' /><Value Type='Lookup'>" + currentContractId + "</Value>" +
                    "</Eq>" +
                "</Where>" +
            "</Query>" +
            "<ViewFields>" +
                "<FieldRef Name='Contract' />" +
                "<FieldRef Name='ActiveStatus' />" +
                "<FieldRef Name='_EndDate' />" +
                "<FieldRef Name='ID' />" +
                "<FieldRef Name='OptionType' />" +
                "<FieldRef Name='OptionNumber' />" +
                "<FieldRef Name='StartDate' />" +
            "</ViewFields>" +
            "</View>");
        this.collListItem = oList.getItems(camlQuery);

        clientContext.load(collListItem);

        clientContext.executeQueryAsync(Function.createDelegate(this, this.onQuerySucceeded), Function.createDelegate(this, this.onQueryFailed));

    }

    function onQuerySucceeded(sender, args) {

        var listItemInfo = '';

        var listItemEnumerator = collListItem.getEnumerator();
        this.contractOptions = new Array();

        while (listItemEnumerator.moveNext()) {
            var oListItem = listItemEnumerator.get_current();

            contractOptions.push({
                Id: oListItem.get_id(),
                OptionNumber: oListItem.get_item('OptionNumber'),
                StartDate: moment(oListItem.get_item('StartDate')).format("M/D/YYYY"),
                EndDate: moment(oListItem.get_item('_EndDate')).format("M/D/YYYY"),
                ActiveStatus: oListItem.get_item('ActiveStatus'),
                OptionType: oListItem.get_item('OptionType')
            });
        }

        contractOptionVM = new EditableGrid.ContractOptionViewModel(contractOptions, currentFormMode, siteUrl, currentContractId);

        ko.applyBindings(contractOptionVM);

        //shows grids so the load "flashing" isn't seen.
        $("#optionExtensionGrids").css("visibility", "visible");
    }

    function onQueryFailed(sender, args) {

        alert('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
    }

    function getQueryString() {
        var assoc = new Array();
        var queryString = unescape(location.search.substring(1));
        var keyValues = queryString.split('&');
        for (var i in keyValues) {
            var key = keyValues[i].split('=');
            assoc[key[0]] = key[1];
        }
        return assoc;
    }

    var contractOptions;
    var contractOptionVM;

    ExecuteOrDelayUntilScriptLoaded(function () {
        currentContractId = getQueryString()["ID"];
        retrieveListItems();
    }, "sp.js");
</script>
