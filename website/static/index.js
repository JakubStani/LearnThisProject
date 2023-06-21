//base.html

function hidePopouts() {
    popouts=document.getElementsByName("popouts");
    console.log(popouts[0]);
    for (popout in popouts) {
        popout.style.display="none";
    }
    console.log("done");
}

function deleteNote(noteId) {

    //sending a request to back-end (to path "/delete-note") using fetch method
    //after it get the respond from "/delete-note" it will reload the window
    //JSON.stringify() turns its argument into a string
    
    fetch("/delete-note", {
    method: "POST",
    body: JSON.stringify({ noteId: noteId }),
    }).then((_res) => {
    window.location.href = "/";
    });
}

    function deleteKit(kitId) {
    fetch("/delete-kit", {
        method: "POST",
        body: JSON.stringify({ kitId: kitId }),
    }).then((_res) => {
        window.location.href= "/learning-kits";
    });
}

function sendKitsData(kitId) {
    fetch("/kits-content", {
        method: "POST",
        body: JSON.stringify({ kitId: kitId }),
    }).then(() => {
        window.location.href= "/kits-content";
    });
}


//kits_content.html

let terms_to_delete=[];

function markTermToDel(termId) {
    console.log(termId);
    terms_to_delete.push(termId);
    list_terms_id=document.getElementsByName("term_id");
    list_terms_cont=document.getElementsByName("term_content");
    list_terms_def=document.getElementsByName("term_definition");
    list_del_t_b=document.getElementsByName("delete_term_button");

    ind_of_term_id=-1;
    for (let i=0;i<list_terms_id.length;i++) {
        if (termId == list_terms_id[i].innerHTML) {
            ind_of_term_id=i;
            break;
        }
    }

    list_terms_cont[ind_of_term_id].setAttribute("hidden", "true");
    list_terms_def[ind_of_term_id].setAttribute("hidden", "true");
    list_del_t_b[ind_of_term_id].setAttribute("hidden", "true");
}

/*
function deleteTerm(termId) { //NIEUŻYWANE !!!
    fetch("/delete-term", {
        method: "POST",
        body: JSON.stringify({ termId: termId})
    }).then((_res)=> {
        window.location.href="/kits-content";
    });
}*/

function deleteTerms() {
    fetch("/delete-term", {
        method: "POST",
        body: JSON.stringify({ terms_to_delete: terms_to_delete})
    }).then((_res)=> {
        window.location.href="/kits-content";
    });
}

function editKit() {
    document.getElementById("kits_title").setAttribute("hidden", "true");
    kits_name_h=document.getElementById("kit_name_header");
    kits_name_h.style.textDecoration="underline";
    kits_name_h.removeAttribute("hidden");
    document.getElementById("start_learning").setAttribute("disabled", "true");
    document.getElementById("kits_test_config_label").style.display="none";
    let test_conf_combobox=document.getElementById("test_conf_combo");
    test_conf_combobox.removeAttribute("disabled");
    document.getElementById(kit_test_c).setAttribute("selected", "true");
    test_conf_combobox.style.display="inline";

    document.getElementById("kit_name_header").removeAttribute("readonly")

    document.getElementById("edit_button").style.display="none";

    document.getElementById("save_button").style.display="inline";

    document.getElementById("cancel_edit_button").style.display="inline";

    document.getElementById("add_new_term_button").style.display="inline";

    terms_content=document.getElementsByName("term_content");
    terms_definition=document.getElementsByName("term_definition");
    delete_term_buttons=document.getElementsByName("delete_term_button");

    for ( let i=0; i<terms_content.length; i++) {
        terms_content[i].removeAttribute("readonly");
        terms_content[i].style.textDecoration="underline";
        terms_definition[i].removeAttribute("readonly");
        terms_definition[i].style.textDecoration="underline";
        delete_term_buttons[i].removeAttribute("hidden");
    }
}

let new_added_terms=[]

function saveChanges(kit_id) {

    let terms_id_list=document.getElementsByName("term_id");
    let terms_content_list=document.getElementsByName("term_content");
    let terms_definition_list=document.getElementsByName("term_definition");
    let terms_id=[];
    let terms_content=[];
    let terms_definition=[];
    let new_added_cont=[];
    let new_added_def=[];

    let kits_new_name= document.getElementById("kit_name_header").value;
    let kits_test_new_config= document.getElementById("test_conf_combo").value;

    for (let i=0;i<terms_content_list.length;i++) {
        terms_id.push(terms_id_list[i].innerHTML)
        terms_content.push(terms_content_list[i].value)
        terms_definition.push(terms_definition_list[i].value)
    }

    for (let i=0;i< new_added_terms.length; i++) {
        new_added_cont.push(document.getElementById(`new_c${i}`).value);
        new_added_def.push(document.getElementById(`new_d${i}`).value);
    }

    //checking whether all values are unique
    set_of_all_values={};
    many_or_empty_values=false;

    whole_cont_to_check=terms_content.concat(new_added_cont);
    whole_def_to_check=terms_definition.concat(new_added_def);

    for (let i=0; i<whole_cont_to_check.length;i++) {
        terms_content_to_check=whole_cont_to_check.slice();
        terms_definition_to_check=whole_def_to_check.slice()
        if (terms_content_to_check[i]=="" || terms_definition_to_check[i]=="" || kits_new_name=="") {
            many_or_empty_values=true;
            break;
        }
        terms_content_to_check.splice(i, 1);
        terms_definition_to_check.splice(i, 1);
    
        //if duplication found (but content and definition can have the same value)
        if (terms_content_to_check.find(o => o==whole_cont_to_check[i] || o=="") 
            || terms_definition_to_check.find(o => o==whole_def_to_check[i] || o=="")
            || terms_definition_to_check.find(o => o==whole_cont_to_check[i])
            || terms_content_to_check.find(o => o==whole_def_to_check[i])) {
            
                many_or_empty_values=true;
                break;
        }
    }

    save_b_info=document.getElementById("save_info");
    for (let i=0;i<kits_names_list.length; i++) {
        if (kits_new_name==kits_names_list[i]) {
            many_or_empty_values=true;
            break;
        }
    }

    if (many_or_empty_values) {
        save_b_info.removeAttribute("hidden");
    }
    else {
        st_learning_b=document.getElementById("start_learning");

        save_b_info.setAttribute("hidden", "true");

        fetch("/save-term-edit-changes", {
            method: "POST",
            body: JSON.stringify({ 
                kit_id: kit_id, 
                kits_new_name: kits_new_name,
                kits_test_new_config: kits_test_new_config, 
                terms_id: terms_id, 
                terms_content: terms_content, 
                new_added_cont: new_added_cont,
                new_added_def: new_added_def,
                terms_definition: terms_definition})
        }).then((_res)=> {

            deleteTerms();
        });
    }
}

function addTermToContent() {

    //creating html elements
    const new_label=document.createElement("label");
    const new_cont=document.createElement("textarea");
    const split_line=document.createTextNode("   |   ");
    const new_def=document.createElement("textarea");
    const new_delete_button=document.createElement("button");
    const break_line=document.createElement("br");
    
    new_label.appendChild(new_cont);
    new_label.appendChild(split_line);
    new_label.appendChild(new_def);
    new_delete_button.innerHTML="&times;";

    new_label.setAttribute(
        "id", `new_l${new_added_terms.length}`
    )

    new_cont.setAttribute(
        "id", `new_c${new_added_terms.length}`
    )

    new_cont.setAttribute(
        "class", "enter_data"
    )

    new_cont.setAttribute(
        "placeholder", "_________________"
    )

    new_def.setAttribute(
        "id", `new_d${new_added_terms.length}`
    )

    new_def.setAttribute(
        "class", "enter_data"
    )

    new_def.setAttribute(
        "placeholder", "_________________"
    )

    new_delete_button.setAttribute(
        "onclick",
        "deleteNewTerm("+(new_added_terms.length)+")"
        );
    
    new_delete_button.setAttribute(
        "class", "functional_button"
    )

    new_delete_button.setAttribute("id", `new_bu${new_added_terms.length}`);

    break_line.setAttribute("id", `new_br${new_added_terms.length}`);

    //adding term to a list of new terms
    new_added_terms.push([new_label, new_delete_button, break_line]);

    //adding new element to site's body
    const content_l=document.getElementById("content_div")

    content_l.insertAdjacentElement("beforeend", new_label);
    content_l.insertAdjacentElement("beforeend", new_delete_button);
    content_l.insertAdjacentElement("beforeend", break_line)
    
}   

function deleteNewTerm(index) {

    //removing term structure from html
    document.getElementById(`new_l${index}`).remove();
    document.getElementById(`new_bu${index}`).remove();
    document.getElementById(`new_br${index}`).remove();

    //deleting specific term
    new_added_terms.splice(index, 1);

    for (let i=index;i<new_added_terms.length;i++) {
        //changing term indexes in labels' id, buttons' id and delete function
        //and break lines
        new_added_terms[i][0].setAttribute(
            "id", `new_l${i}`
        )

        new_added_terms[i][1].setAttribute(
            "onclick",
            "deleteNewTerm("+(i)+")"
        );

        new_added_terms[i][1].setAttribute(
            "id", `new_bu${i}`
        )
        
        new_added_terms[i][2].setAttribute(
            "id", `new_br${i}`
        )
    }
}

function cancelEdit() {
    window.location.href="/kits-content";
}


//learnign.html

let correct_answ_number=-1;
let term_to_ask_index=-1;

function getRandomTerm(array_with_terms_length) {

    //choses index of random term (from possible indexes of array_with_terms list)
    random=Math.floor(Math.random()*array_with_terms_length);
    return random;
}

function loadTest() { 
    document.getElementById("next_q_b_container").setAttribute("hidden", "true");

    //select random term from terms that left
    //this term's content or definition will be the answer
    answ_label=document.getElementById("answ_info")
    if (terms_left.length>0) {
        answ_label.setAttribute(
            "hidden", "true"
        )

        //for all configurations
        term_to_ask_index=getRandomTerm(terms_left.length);
        let term_to_ask=terms_left[term_to_ask_index];

        if (all_terms_for_test.length <4){
            min_num_of_answ=all_terms_for_test.length -1;
        }
        else {
            min_num_of_answ=3;
        }

        answers=chooseAnswers(term_to_ask, min_num_of_answ);
        //chosing which button will have correct answer
        correct_answ_number=getRandomTerm(answers.length + 1); //+1 because definitions have 3 defs
        //inserting term to the answers at correct_answ_number index
        answers.splice(correct_answ_number, 0, term_to_ask)

        //for specific configuration:

        let option=["content", "definition"];
        //asking for definition part:
        if (kit_cfg=="Ask for definition") {
            prepareQuestionAndAnswersLayout("content")
        }

        else if (kit_cfg=="Ask for content") {
            prepareQuestionAndAnswersLayout("definition")
        }

        else {
            if (Math.random()<0.5){
                chose=option[0];
            }

            else {
                chose=option[1];
            }
            
            prepareQuestionAndAnswersLayout(chose)
        }

    }
    else {
        answ_label.removeAttribute("hidden")

        answ_label.setAttribute(
            "class", "correct_label"
        )

        answ_label.innerHTML="Great! You completed kit's test!";
        document.getElementById("back_to_learning_kits_b").removeAttribute("hidden");
    }
}

function prepareQuestionAndAnswersLayout(chose) {
    document.getElementById("question_label").innerHTML=terms_left[term_to_ask_index][chose];

    if (chose=="content") {
        chose2="definition";
    }
    else {
        chose2="content";
    }
    //changing answer buttons' text
    for(let i=0;i<answers.length;i++) {
        answ_button=document.getElementById(`answ_${i}`);
        answ_button.innerHTML=answers[i][chose2];
        answ_button.removeAttribute("hidden");
    }
}

function chooseAnswers(term_to_ask, min_num_of_answ) {
    
    terms_other_than_asked=all_terms_for_test.slice();
    terms_other_than_asked.splice(findIndexOfTerm(term_to_ask, all_terms_for_test), 1);

    let answers=[]

    //choosing answers- 3 wrong answers and 1 correct
    for (let i=0;i<min_num_of_answ;i++) {
        index_of_chosen_definition=getRandomTerm(terms_other_than_asked.length);
        answers.push(terms_other_than_asked[index_of_chosen_definition]);
        terms_other_than_asked.splice(index_of_chosen_definition, 1);
    }
    
    return answers;
}

function findIndexOfTerm(term_to_find, array_of_terms) {
    for (let i=0;i<array_of_terms.length;i++) {
        if(term_to_find["content"]==array_of_terms[i]["content"]) {
            console.log("found index:",i);
            return i;
        }
    }

    return -1;
}

function checkAnswer(answer) {
    answ_label=document.getElementById("answ_info")
    answ_label.removeAttribute("hidden");
    if (answer==correct_answ_number) {

        //deleting correctly provided term from terms that left
        terms_left.splice(term_to_ask_index, 1);
        count_label=document.getElementById("num_of_learned_terms");
        console.log(count_label.innerHTML);
        count_label.innerHTML=Number(count_label.innerHTML)+1;
        answ_label.innerHTML="Correct!"
        answ_label.setAttribute(
            "class", "correct_label"
        )
        
        loadTest();
    }
    else {
        answ_label.setAttribute(
            "class", "warning_label"
        )
        corr_answ=document.getElementById(`answ_${correct_answ_number}`).innerHTML;
        console.log(corr_answ);
        answ_label.innerHTML=`Wrong. Correct answer is \"${corr_answ}\"`;
        answ_bts=document.getElementsByName("answ_b");
        for (let i=0;i<answ_bts.length; i++) {
            answ_bts[i].setAttribute("hidden", "true")
        }
        document.getElementById("next_q_b_container").removeAttribute("hidden");
    }
}


//learning_kits.html
function createNewTerm() {
    document.getElementById("kit").removeAttribute("hidden");
    document.getElementById("save_k_button").removeAttribute("hidden");
    document.getElementById("cancel_save_k_b").removeAttribute("hidden");
    document.getElementById("cr_kit_b").setAttribute("hidden", "true");

}