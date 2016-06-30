function setToolTip(elementID, content, textColor) {
    var tooltip = d3.select("#tooltip");
    var mine = d3.select("#" + elementID);
    mine.on("mouseout", function () {
        tooltip.attr("class", "normalShadow");
        return tooltip.style("visibility", "hidden");
    });
    mine.on("mousemove", function () {
        tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
    });

    mine.on("mouseover", function () {
        tooltip.style("color", textColor);
        tooltip.html(content);
        tooltip.style("visibility", "visible");
        tooltip.attr("class","crimeInfoHover");
    });
}

function initializeCrimeInformationFields() {
    let tab = "&nbsp&nbsp&nbsp&nbsp";
    // All Crimes Information
    // http://ukcrimestats.com/blog/faqs/what-do-the-crime-categories-mean/
    let index = 0;
    let color = data.crimeTypes[Object.keys(data.crimeTypes)[index]].color;
    let text = "In this category all crime types are aggregated/summed up together to get an overall summary.<br><br>"
                +"Total for all categories including crime and Anti-Social Behaviour (ASB).";
    setToolTip("category_" + index, text, color);
    setToolTip("label_category_" + index, text, color);

    // Burglary
    index = 1;
    color = data.crimeTypes[Object.keys(data.crimeTypes)[index]].color;
    text = "Includes offences where a person enters a house or other building with the intention of stealing. <br><br>" +
        "The CSEW covers <b>domestic</b> burglary only, which is an unauthorised entry into the victim's <br>    dwelling or non-connected building to a dwelling, but does not necessarily involve forced entry; it <br>    may be through an open window, or by entering the property under false pretences (for example, <br>    impersonating an official).<br><br>    CSEW domestic burglary does not cover theft by a person who is entitled to be in the dwelling at<br>    the time of the offence (for example, party guests or workmen); this is called <b>theft from a dwelling</b><br>    and is included in the sub-category 'Other household theft'. <br><br>"
        + "<i>Key elements of police recorded burglaries (as defined by the Theft Act 1968) are entry (or attempted entry) <br>"
        + "to a building as a trespasser with intent to either (a) steal property from it (including stealing or attempting to steal),<br>"
        + "(b) inflict grievous bodily harm or (c) commit unlawful damage to property whilst inside. <br>"
        + "The offence group also includes aggravated burglary (Section 10 of the same Act), <br></i>"
        + "which is defined as a burglary where the burglar is in possession of a weapon at the time.";
    setToolTip("category_" + index, text, color);
    setToolTip("label_category_" + index, text, color);

    // Anti-Social Behaviour
    index = 2;
    color = data.crimeTypes[Object.keys(data.crimeTypes)[index]].color;
    text = "Includes personal, environmental and nuisance anti-social behaviour. <br>N.B. ASB is not a crime but a civil offence. <br><br>" +
        "The term <b>'anti-social behaviour'</b> (ASB) was formalised in the late 1990s to describe a wide range of<br>" +
        "the nuisance, disorder and crime that affect people's daily lives.<br>" +
        "The Crime and Disorder Act 1998 defined anti-social behaviour in law as someone 'acting in a<br>" +
        "manner that caused or was likely to cause harassment, alarm or distress to one or more persons<br>" +
        "not of the same household as himself'.";
    setToolTip("category_" + index, text, color);
    setToolTip("label_category_" + index, text, color);

    // Vehicle Crime
    index = 3;
    color = data.crimeTypes[Object.keys(data.crimeTypes)[index]].color;
    text = "Includes theft from or of a vehicle or interference with a vehicle. <br><br>" +
        "For <b>vehicle crime</b>, if a vehicle is stolen and later found deliberately burnt out by the same offender, <br>" +
        "one crime of theft of a vehicle is recorded by the police and in the CSEW. If there is evidence that<br>" +
        "someone unconnected with the theft committed the arson, then an offence of arson is recorded by<br>" +
        "the police in addition to the theft. For the CSEW, only an offence of theft of a vehicle would be<br>" +
        "recorded as in practice it would often not be possible to establish that the arson was committed by<br>" +
        "someone unconnected with the theft <br>";
    setToolTip("category_" + index, text, color);
    setToolTip("label_category_" + index, text, color);

    // Robbery
    index = 4;
    color = data.crimeTypes[Object.keys(data.crimeTypes)[index]].color;
    text = "Includes offences where a person uses force or threat of force to steal. <br><br>" +
        "<b>Robbery</b> is an offence in which force, or the threat of force, is used either during <br>or immediately prior to a theft or attempted theft. <br><br>"
        + "Key elements of the offence of robbery (Section 8 of the Theft Act 1968) are stealing and the use <br>"
        + "or threat of force immediately before doing so, and in order to do so. Any injuries resulting from this <br>"
        + "force are not recorded as additional offences of violence.";
    setToolTip("category_" + index, text, color);
    setToolTip("label_category_" + index, text, color);

    // Other Crime
    index = 5;
    color = data.crimeTypes[Object.keys(data.crimeTypes)[index]].color;
    text = "Includes forgery, perjury and other miscellaneous crime. </br></br>"
        + "Within the category 'Other Crime', all crimes are reported, which had </br>"
        + "no individual category at the specific point in time, when the crime happened.</br>"
        + "In July 2011 in this category fell 1293 different offences, which needed to be </br>"
        + "distinguished over time. Category splitting takes place when a specific subcategory </br>"
        + "contains significantly more crimes than other subcategory and consequently must be considered separately</br></br>"
        + "In September 2011, Other Crime was divided into 6 categories - Drugs, </br>"
        + "Public Disorder & Weapons (which was later split further and so is not displayed here), </br>"
        + "Criminal Damage & Arson (CD&A), Theft - Shoplifting, Theft-Other and Other."
        + "</br></br>From May 2013, the following changes were made to the crime categories: </br>"
        + " Both 'other firearms offences' and 'other knives offences' which were in <b>'other crime'</b> were moved into <b>'possession of weapons'</b>.";
    setToolTip("category_" + index, text, color);
    setToolTip("label_category_" + index, text, color);

    // Shoplifting
    index = 6;
    color = data.crimeTypes[Object.keys(data.crimeTypes)[index]].color;
    text = "Includes theft from shops or stalls.<br><br>Theft by customers <br><br>"
        +"";
    setToolTip("category_" + index, text, color);
    setToolTip("label_category_" + index, text, color);

    // Drugs
    index = 7;
    color = data.crimeTypes[Object.keys(data.crimeTypes)[index]].color;
    text = "Includes offences related to possession, supply and production of drugs.";
    setToolTip("category_" + index, text, color);
    setToolTip("label_category_" + index, text, color);

    // Criminal Damage and Arson
    index = 8;
    color = data.crimeTypes[Object.keys(data.crimeTypes)[index]].color;
    text = "Includes damage to buildings and vehicles and deliberate damage by fire. <br><br>"
        +"In the CSEW, criminal damage is defined as the intentional and malicious damage to the home, <br>" +
        "other property or vehicles. Criminal damage in the CSEW ranges from arson to graffiti. Cases <br>" +
        "where there is nuisance only (for example, letting down car tyres) or where the damage is <br>" +
        "accidental are not included. <br><br><br>" +
        "Police recorded <b>criminal damage</b> results from any person who without lawful excuse destroys or <br>" +
        "damages any property belonging to another, intending to destroy or damage any such property or <br>" +
        "being reckless as to whether any such property would be destroyed or damaged. Damage which is <br>" +
        "repairable without cost, or which is accidental, is not included in police recorded crime statistics. <br>" +
        "Separate recorded crime figures exist for criminal damage to a dwelling, to a building other than a <br>" +
        "dwelling, to a vehicle and other criminal damage. Figures are also published for racially or <br>" +
        "religiously aggravated criminal damage.<br><br>" +
        "<b>Arson</b> is the act of deliberately setting fire to property, including buildings and vehicles. In the <br>" +
        "CSEW this is any deliberate damage to property belonging to the respondent or their household <br>" +
        "caused by fire, regardless of the type of property involved. The only exception is where the item <br>" +
        "that is set on fire was stolen first (this is coded as theft). <br><br>";
    setToolTip("category_" + index, text, color);
    setToolTip("label_category_" + index, text, color);

    // Other Theft
    index = 9;
    color = data.crimeTypes[Object.keys(data.crimeTypes)[index]].color;
    text = "Theft of property from outside people's homes (for example,<br> garden furniture and tools) and theft of unattended property, as measured by the CSEW,<br> are incorporated within the police recorded crime category 'other theft'."
        + "</br></br>From May 2013, the following changes were made to the crime categories: <br>"
        + "A new category for <b>'bicycle theft'</b> was created which previously fell within <b>'other theft'</b> </br>"
        + "A new category for <b>'theft from the person'</b> was created which previously fell within <b>'other theft'</b> <br><br>"
        + "The offence group of <b>other theft</b> offences covers thefts that are not covered <br>"
        + "by other acquisitive crime offence groups.<br><br>"
        + "Includes theft by an employee, blackmail and making off without payment.";
    setToolTip("category_" + index, text, color);
    setToolTip("label_category_" + index, text, color);

    // Bicycle Theft
    index = 10;
    color = data.crimeTypes[Object.keys(data.crimeTypes)[index]].color;
    text = "Includes the taking without consent or theft of a pedal cycle."
        + "</br></br>From May 2013, the following changes were made to the crime categories: <br>"
        + "A new category for <b>'bicycle theft'</b> was created which previously fell within <b>'other theft'</b> </br>"
        + "A new category for <b>'theft from the person'</b> was created which previously fell within <b>'other theft'</b>";
    setToolTip("category_" + index, text, color);
    setToolTip("label_category_" + index, text, color);

    // Theft from the person
    index = 11;
    color = data.crimeTypes[Object.keys(data.crimeTypes)[index]].color;
    text = "Includes crimes that involve theft directly from the victim (including handbag, <br>"
        + "wallet, cash, mobile phones) but without the use or threat of physical force.";
    setToolTip("category_" + index, text, color);
    setToolTip("label_category_" + index, text, color);

    // Public Disorder and Weapons
    index = 12;
    color = data.crimeTypes[Object.keys(data.crimeTypes)[index]].color;
    text = "Includes offences which cause fear, alarm, distress or a possession of a weapon such as a firearm."
        + "</br></br>From May 2013, the following changes were made to the crime categories: <br>"
        + "<b>Public disorder and weapons</b> were then split into two new categories; <b>'public order'</b> and <b>'possession of weapons'</b>";
    setToolTip("category_" + index, text, color);
    setToolTip("label_category_" + index, text, color);

    // Public Order
    index = 13;
    color = data.crimeTypes[Object.keys(data.crimeTypes)[index]].color;
    text = "Includes offences which cause fear, alarm or distress."
        + "</br></br>From May 2013, the following changes were made to the crime categories: <br>"
        + "<b>Public disorder and weapons</b> were then split into two new categories; <b>'public order'</b> and <b>'possession of weapons'</b><br><br>"
        + "Reported in this category: <br>"
        + tab + "- Public fear, alarm or distress  <br>"
        + tab + "- Treason, Violent disorder, Treason felony <br>"
        + tab + "- Riot, Violent disorder, Other offences against the State or public order";
    setToolTip("category_" + index, text, color);
    setToolTip("label_category_" + index, text, color);

    // Possession of Weapons
    index = 14;
    color = data.crimeTypes[Object.keys(data.crimeTypes)[index]].color;
    text = "Includes possession of a weapon, such as a firearm or knife."
        + "</br></br>From May 2013, the following changes were made to the crime categories: <br>"
        + "<b>Public disorder and weapons</b> were then split into two new categories; <b>'public order'</b> and <b>'possession of weapons'</b>";
    setToolTip("category_" + index, text, color);
    setToolTip("label_category_" + index, text, color);

    // Violent Crime
    index = 15;
    color = data.crimeTypes[Object.keys(data.crimeTypes)[index]].color;
    text = "Includes offences against the person such as common assaults, Grievous Bodily Harm and sexual offences.<br><br>"
        +"<b>Violent crime</b> in the Crime Survey for England and Wales (CSEW) is referred to as 'violence', <br> "+
        "and includes wounding and assault (for both completed and attempted incidents). <br>" +
        "There is also an additional breakdown of violence with, or without injury. <br> "+
        "Violent offences in police recorded data are referred to as <b>'violence against the person'</b><br>"+
        "and include homicide, violence with injury, and violence without injury. <br><br>" +
        "<b>Violent crime</b> covers a range of offence types from minor assaults, such as pushing and shoving that result <br>" +
        "in no physical harm, to murder. This includes offences where the victim was intentionally stabbed, punched, kicked, pushed,  <br>" +
        "jostled, etc. as well as offences where the victim was threatened with violence whether or not there is any injury. </br></br>" +
        "From May 2013, the following changes were made to the crime categories: <br>" +
        "The <b>violent crime</b> category was renamed <b>'violence and sexual offences'</b> <br><br>"+
        "<b>'Violence against the person'</b> offences contain the full spectrum of assaults, from pushing and<br>" +
        "shoving that result in no physical harm, to murder. Even within the same offence classification, the<br>"+
        "severity of violence varies considerably between incidents.";
    setToolTip("category_" + index, text, color);
    setToolTip("label_category_" + index, text, color);

    // Violence and Sexual Offences
    index = 16;
    color = data.crimeTypes[Object.keys(data.crimeTypes)[index]].color;
    text = "Includes offences against the person such as common assaults, <br>Grievous Bodily Harm and sexual offences. <br><br>"
        + "<b>Violent crime</b> covers a wide range of offences, from minor assaults such as pushing and</br>" +
        "shoving that result in no physical harm through to serious incidents of wounding and homicide.</br></br>" +
        "<b>Sexual offences</b> include rape, sexual assault and unlawful </br>" +
        "sexual activity against adults and children, sexual grooming and indecent exposure.</br></br>" +
        "From May 2013, the following changes were made to the crime categories: <br>" +
        "The <b>violent crime</b> category was renamed <b>'violence and sexual offences'</b><br><br>"+
        "<b>'Violence against the person'</b> offences contain the full spectrum of assaults, from pushing and<br>" +
        "shoving that result in no physical harm, to murder. Even within the same offence classification, the<br>"+
        "severity of violence varies considerably between incidents.";
    setToolTip("category_" + index, text, color);
    setToolTip("label_category_" + index, text, color);
}

