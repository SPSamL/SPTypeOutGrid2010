var siteUrl = '/sites/demo';
var currentContractId;

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

    while (listItemEnumerator.moveNext()) {
        var oListItem = listItemEnumerator.get_current();

        contractContractOptions.push({
        Id: oListItem.get_id(),
        OptionNumber: oListItem.get_item('OptionNumber'),
        StartDate: oListItem.get_item('Start Date'),
        EndDate: oListItem.get_item('End Date'),
        ActiveStatus: oListItem.get_item('ActiveStatus'),
        OptionType: oListItem.get_item('OptionType')
        });
    }

    if (contractOptions != null && contractOptions != undefined && contractOptions.length > 0)
        contractOptions = JSON.parse(contractOptions);
    else
        contractOptions = undefined;

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