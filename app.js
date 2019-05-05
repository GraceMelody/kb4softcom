'use strict';

const FIRE_THRESHOLD = 0.4

const membershipFunction = {
    age: {
        "Very Young": x => m_left_shoulder(21.75, 25)(x),
        "Young": x => m_triangle(21.75, 25, 29)(x),
        "Old": x => m_right_shoulder(25, 29)(x),
    },
    overall: {
        'Low': x => m_left_shoulder(61, 66)(x),
        'Medium': x => m_triangle(61, 66, 70)(x),
        'High': x => m_right_shoulder(66, 70)(x)
    },
    value: {
        'Low': x => m_left_shoulder(267.5, 600)(x),
        'Medium': x => m_triangle(267.5, 600, 1225)(x),
        'High': x => m_right_shoulder(600, 1225)(x),
    },
    wage: {
        'Low': x => m_left_shoulder(1, 2)(x),
        'Medium': x => m_triangle(1, 2, 6)(x),
        'High': x => m_right_shoulder(2, 6)(x)
    },
    height: {
        'Low': x => m_left_shoulder(155.7528, 179.832)(x),
        'Medium': x => m_triangle(155.7528, 179.832, 188.976)(x),
        'High': x => m_right_shoulder(179.832, 188.976)(x)
    },
    weight: {
        'Low': x => m_left_shoulder(71.21400209, 74.84274105)(x),
        'Medium': x => m_triangle(71.21400209, 74.84274105, 81.41983042)(x),
        'High': x => m_right_shoulder(74.84274105, 81.41983042)(x)
    },
    agility: {
        'Low': x => m_left_shoulder(56, 65.5)(x),
        'Medium': x => m_triangle(56, 65.5, 75)(x),
        'High': x => m_right_shoulder(65.5, 75)(x)
    },
    strength: {
        'Low': x => m_left_shoulder(59, 67)(x),
        'Medium': x => m_triangle(59, 67, 75)(x),
        'High': x => m_right_shoulder(67, 75)(x)
    },
    vision: {
        'Low': x => m_left_shoulder(42.75, 54)(x),
        'Medium': x => m_triangle(42.75, 54, 62.25)(x),
        'High': x => m_right_shoulder(54, 62.25)(x)
    }
}


// Membership functions
function m_trapezoid(a,b,c,d) {
    return function(x) {
        if ( x < a || x > d ) {
            return 0.0
        } 
        else if ( a <= x && x <= b ) {
            return ( (x-a) / (b-a) )
        }
        else if ( b <= x && x <= c ) {
            return 1
        }
        else if ( x >= c ) {
            return ( (d-x) / (d-c) )
        } else {
            return NaN
        }
    }
}

function m_triangle(a,b,c) {
    return m_trapezoid(a,b,b,c)
}

function m_left_shoulder(a,b) {
    return m_trapezoid(-Infinity, -Infinity, a, b)
}

function m_right_shoulder(a,b) {
    return m_trapezoid(a, b, Infinity, Infinity)
}


$(document).ready(function() {

    // Adds "All"
    $(".dropdown .dropdown-menu").prepend('<li><a href="#">All</a></li>')

    $(".dropdown a").on("click", function(event){
        const dropdown = $(this).closest(".dropdown")
        const title = dropdown.find(".drop-title")
        const attr = (title.contents()[0]).nodeValue.trim()

        const val = this.innerHTML.trim()
        
        $(this).closest("li").siblings().removeAttr("selected")
        if (val == "All") {
            title.html(dropdown.data("attr"))
        } else {
            $(this).closest("li").attr("selected", "selected")
            title.html(val)
        }

        
        
        event.preventDefault()
    })

    $(".btn-filter").on("click", function(event) {
        doFilter()
    })

    // Finds all attributes that are set
    function getSelectedAttributesKeyVal() {
        const dropdownsWithAttr = $(".dropdown").filter((i,elm)=>{
            const lists = $(elm).find("li") // Find all List in dropdown
            const noOfSelected = lists.filter((i,e)=>$(e).attr("selected")).length // Find number of selected elements

            return noOfSelected > 0 // Take the element if selection exists
        })


        const retObj = {}

        dropdownsWithAttr.map((i, elm)=>{
            const key = $(elm).data("attr")
            const val = $(elm).find("[selected]").find("a").html().trim()
            retObj[key] = val
        })
        return retObj
    }

    // Is this attribute categorical?
    function isCategorical(k) {
        const categoricals = ["nationality", "preferred-foot", "body-type"]
        return categoricals.includes(k)
    }

    // Given a row, find the value for the attribute
    function getAttrFromRow(row, attr) {
        return $(row).find(`td.${attr}`).html().trim()
    }

    // Find the membership for specified key, domain, and actual value
    // key: Age, Nationality, Weight, ...
    // desiredVal: Very Young, Young, Old, Low, Left, ...
    // rowVal: 31, 140, Left, ...
    function getMembership(key, desiredVal, rowVal) {
        // Check if the given key is categorical. If yes, return 'absolute' value
        if (isCategorical(key)) {
            if (desiredVal == rowVal) {
                return 1.0
            } else {
                return 0.0
            }
        }

        const m =  membershipFunction[key][desiredVal](rowVal)
        return m
    }

    // Calculates fire strength for the row
    function calculateFireStrength(elm) {
        const attributesKV = getSelectedAttributesKeyVal()

        let membership_values = []
        for (const key in attributesKV) {
            const desiredVal = attributesKV[key]

            const normalizedKey = key.toLowerCase().replace(" ", "-") // To Lower; Converts space to -

            const rowVal = getAttrFromRow(elm, normalizedKey)

            const membership = getMembership(normalizedKey, desiredVal, rowVal)
            membership_values.push(membership)
        }

        const fireStrength = membership_values.reduce((a,b) => Math.min(a,b)) // Uses MIN to reduce values (AND)
        

        return fireStrength
    }


    function clearFilter() {
        const rows = $("table.table tbody").find("tr")
        rows.show()
    }

    function doFilter() {
        clearFilter()
        const rows = $("table.table tbody").find("tr")
        const filtered = rows.filter((i, row) => {
            const fireStrength = calculateFireStrength(row)
            return fireStrength < FIRE_THRESHOLD // If true this row will be hidden
        }).hide()
    }
})