import Head from "next/head";
import { useState, useEffect } from "react";
import { PDFViewer } from "@react-pdf/renderer";
import { db } from "../lib/Database";
import Navigation from "../components/Navigation";
import GenerateSidebar from "../components/GenerateSidebar";
import shuffle from "../lib/FisherYatesShuffle";
import TestPaperViewer from "../components/TestPaperViewer";

const { log, table } = console;

/**
 * specification data type
 * [
 *      {
 *          name: "specification"
 *          data: [{}, {}, {}]
 *          count: 0
 *      }
 *      {
 *          name: "specification"
 *          data: [{}, {}, {}]
 *          count: 0
 *      }
 * ]
 *
 * TODO
 * [/] after chapters are selected, shuffle
 * [/] filter each specification, save in own variable or in an array of object
 * [/] get user input on how many items per specification
 * [ ] get the first N of each specification
 * [ ] save all specification in one variable
 * [ ] shuffle all specification
 */

const Generate = () => {
    const [multipleChoice, setMultipleChoice] = useState([]);
    const [identification, setIdentification] = useState([]);
    const [essay, setEssay] = useState([]);

    const [selectedSubject, setSelectedSubject] = useState("");
    const [availableChapters, setAvailableChapters] = useState([]);
    const [selectedChapters, setSelectedChapters] = useState([]);

    const [selectedChaptersMultipleChoice, setSelectedChaptersMultipleChoice] = useState([]);
    const [selectedChaptersIdentification, setSelectedChaptersIdentification] = useState([]);
    const [selectedChaptersEssay, setSelectedChaptersEssay] = useState([]);

    const [shuffledSelectedMultipleChoice, setShuffledSelectedMultipleChoice] = useState([]);
    const [shuffledSelectedIdentification, setShuffledSelectedIdentification] = useState([]);
    const [shuffledSelectedEssay, setShuffledSelectedEssay] = useState([]);

    const [specificationMultipleChoice, setSpecificationMultipleChoice] = useState([]);
    const [specificationIdentification, setSpecificationIdentification] = useState([]);
    const [specificationEssay, setSpecificationEssay] = useState([]);

    const [finalMultipleChoice, setFinalMultipleChoice] = useState([]);
    const [finalIdentification, setFinalIdentification] = useState([]);
    const [finalEssay, setFinalEssay] = useState([]);

    const [drawer, setDrawer] = useState(false);

    const getData = () => {
        db.collection("multipleChoice")
            .get()
            .then((data) => setMultipleChoice(data));

        db.collection("identification")
            .get()
            .then((data) => setIdentification(data));

        db.collection("essay")
            .get()
            .then((data) => setEssay(data));
    };

    const selectingSubject = (event) => {
        const { value } = event.target;

        setSelectedSubject(value);
        setSelectedChapters([]);
    };

    const getAvailableLessons = () => {
        const subjectList = [...multipleChoice, ...identification, ...essay];
        const filteredSubject = subjectList.filter((item) => {
            return item.subject == selectedSubject;
        });

        let tempLessons = Array.from(new Set(filteredSubject.map((item) => item.chapterNo)));

        tempLessons.sort((a, b) => a - b);

        setAvailableChapters(tempLessons);
    };

    const selectingAvailableChapters = (event) => {
        const { checked, value } = event.target;

        if (checked === true) {
            setSelectedChapters((old) => [...old, value]);
        } else {
            let tempData = [...selectedChapters];
            let index = tempData.indexOf(value);

            tempData.splice(index, 1);

            setSelectedChapters(tempData);
        }
    };

    const getSelectedChapters = () => {
        let tempSelectedChaptersMultipleChoice = [];
        let tempSelectedChaptersIdentification = [];
        let tempSelectedChaptersEssay = [];

        selectedChapters.forEach((chapter) => {
            let tempFilterMultiple = multipleChoice.filter((item) => {
                return item.chapterNo === chapter && item.subject === selectedSubject;
            });

            let tempFilterIdentification = identification.filter((item) => {
                return item.chapterNo === chapter && item.subject === selectedSubject;
            });

            let tempFilterEssay = essay.filter((item) => {
                return item.chapterNo === chapter && item.subject === selectedSubject;
            });

            tempSelectedChaptersMultipleChoice = [
                ...tempSelectedChaptersMultipleChoice,
                ...tempFilterMultiple,
            ];

            tempSelectedChaptersIdentification = [
                ...tempSelectedChaptersIdentification,
                ...tempFilterIdentification,
            ];

            tempSelectedChaptersEssay = [...tempSelectedChaptersEssay, ...tempFilterEssay];
        });

        setSelectedChaptersMultipleChoice(tempSelectedChaptersMultipleChoice);
        setSelectedChaptersIdentification(tempSelectedChaptersIdentification);
        setSelectedChaptersEssay(tempSelectedChaptersEssay);
    };

    const shuffleSelectedChapters = () => {
        setShuffledSelectedMultipleChoice(shuffle(selectedChaptersMultipleChoice));
        setShuffledSelectedIdentification(shuffle(selectedChaptersIdentification));
        setShuffledSelectedEssay(shuffle(selectedChaptersEssay));
    };

    const getFilteredAvailableSpecification = () => {
        let tempSpecificationMultipleChoice = [];
        let tempSpecificationIdentification = [];
        let tempSpecificationEssay = [];

        let tempMultipleChoiceSpecification = Array.from(
            new Set(shuffledSelectedMultipleChoice.map((item) => item.specification))
        );

        let tempIdentificationSpecification = Array.from(
            new Set(shuffledSelectedIdentification.map((item) => item.specification))
        );

        let tempEssaySpecification = Array.from(
            new Set(shuffledSelectedEssay.map((item) => item.specification))
        );

        tempMultipleChoiceSpecification.forEach((specification) => {
            let temp = shuffledSelectedMultipleChoice.filter((item) => {
                return item.specification === specification;
            });

            tempSpecificationMultipleChoice = [
                ...tempSpecificationMultipleChoice,
                { name: specification, data: temp, count: 0 },
            ];
        });

        tempIdentificationSpecification.forEach((specification) => {
            let temp = shuffledSelectedIdentification.filter((item) => {
                return item.specification === specification;
            });

            tempSpecificationIdentification = [
                ...tempSpecificationIdentification,
                { name: specification, data: temp, count: 0 },
            ];
        });

        tempEssaySpecification.forEach((specification) => {
            let temp = shuffledSelectedEssay.filter((item) => {
                return item.specification === specification;
            });

            tempSpecificationEssay = [
                ...tempSpecificationEssay,
                { name: specification, data: temp, count: 0 },
            ];
        });

        setSpecificationMultipleChoice(tempSpecificationMultipleChoice);
        setSpecificationIdentification(tempSpecificationIdentification);
        setSpecificationEssay(tempSpecificationEssay);
    };

    const updateCount = (operation, type, specification) => {
        if (operation) {
            if (type === "multipleChoice") {
                setSpecificationMultipleChoice((oldState) => {
                    let newState = oldState.map((object) => {
                        if (object.data.length <= object.count) {
                            return object;
                        }

                        if (object.name === specification) {
                            return { ...object, count: ++object.count };
                        }

                        return object;
                    });

                    return newState;
                });
            } else if (type === "identification") {
                setSpecificationIdentification((oldState) => {
                    let newState = oldState.map((object) => {
                        if (object.data.length <= object.count) {
                            return object;
                        }

                        if (object.name === specification) {
                            return { ...object, count: ++object.count };
                        }

                        return object;
                    });

                    return newState;
                });
            } else if (type === "essay") {
                setSpecificationEssay((oldState) => {
                    let newState = oldState.map((object) => {
                        if (object.data.length <= object.count) {
                            return object;
                        }

                        if (object.name === specification) {
                            return { ...object, count: ++object.count };
                        }

                        return object;
                    });

                    return newState;
                });
            }
        } else {
            if (type === "multipleChoice") {
                setSpecificationMultipleChoice((oldState) => {
                    let newState = oldState.map((object) => {
                        if (object.count <= 0) {
                            return object;
                        }

                        if (object.name === specification) {
                            return { ...object, count: --object.count };
                        }

                        return object;
                    });

                    return newState;
                });
            } else if (type === "identification") {
                setSpecificationIdentification((oldState) => {
                    let newState = oldState.map((object) => {
                        if (object.count <= 0) {
                            return object;
                        }

                        if (object.name === specification) {
                            return { ...object, count: --object.count };
                        }

                        return object;
                    });

                    return newState;
                });
            } else if (type === "essay") {
                setSpecificationEssay((oldState) => {
                    let newState = oldState.map((object) => {
                        if (object.count <= 0) {
                            return object;
                        }

                        if (object.name === specification) {
                            return { ...object, count: --object.count };
                        }

                        return object;
                    });

                    return newState;
                });
            }
        }
    };

    // this function will get the fist N of multiple choice based on their specifications:
    // and return overall shuffled multiple choice items
    const getMultipleChoice = () => {
        let multipleChoice = specificationMultipleChoice;
        let tempMultipleChoice = [];
        let tempQuestionOnly = [];

        multipleChoice.forEach((item) => {
            let tempItem = item.data.slice(0, item.count);

            tempMultipleChoice = [
                ...tempMultipleChoice,
                { name: item.name, data: tempItem, count: item.count },
            ];
        });

        tempMultipleChoice.forEach((item) => {
            let tempData = item.data;
            tempQuestionOnly = [...tempQuestionOnly, ...tempData];
        });

        return shuffle(tempQuestionOnly);
    };

    // and return overall shuffled identification items
    const getIdentification = () => {
        let identification = specificationIdentification;
        let tempIdentification = [];
        let tempQuestionOnly = [];

        identification.forEach((item) => {
            let tempItem = item.data.slice(0, item.count);

            tempIdentification = [
                ...tempIdentification,
                { name: item.name, data: tempItem, count: item.count },
            ];
        });

        tempIdentification.forEach((item) => {
            let tempData = item.data;
            tempQuestionOnly = [...tempQuestionOnly, ...tempData];
        });

        return shuffle(tempQuestionOnly);
    };

    const getEssay = () => {
        let essay = specificationEssay;
        let tempEssay = [];
        let tempQuestionOnly = [];

        essay.forEach((item) => {
            let tempItem = item.data.slice(0, item.count);

            tempEssay = [...tempEssay, { name: item.name, data: tempItem, count: item.count }];
        });

        tempEssay.forEach((item) => {
            let tempData = item.data;
            tempQuestionOnly = [...tempQuestionOnly, ...tempData];
        });

        return shuffle(tempQuestionOnly);
    };

    const getFirstNOfShuffledItems = () => {
        let multipleChoice = getMultipleChoice();
        let identification = getIdentification();
        let essay = getEssay();

        setFinalMultipleChoice(multipleChoice);
        setFinalIdentification(identification);
        setFinalEssay(essay);
    };

    useEffect(() => {
        getData();
    }, []);

    useEffect(() => {
        getAvailableLessons();
    }, [selectedSubject]);

    useEffect(() => {
        getSelectedChapters();
    }, [selectedChapters]);

    useEffect(() => {
        shuffleSelectedChapters();
    }, [selectedChaptersMultipleChoice, selectedChaptersIdentification, selectedChaptersEssay]);

    useEffect(() => {
        getFilteredAvailableSpecification();
    }, [shuffledSelectedMultipleChoice, shuffledSelectedIdentification, shuffledSelectedEssay]);

    useEffect(() => {
        getFirstNOfShuffledItems();
    }, [specificationMultipleChoice, specificationIdentification, specificationEssay]);

    return (
        <>
            <Head>
                <title>Generate</title>
            </Head>

            <div className="container-fluid">
                <div className="columns is-desktop">
                    <div className="column is-4 sidebar">
                        <div
                            className={`p-5 sidebar--content z-10 small-drawer ${
                                drawer == true ? "open" : "close"
                            }`}
                        >
                            <div
                                className="delete close-drawer"
                                onClick={() => {
                                    setDrawer((old) => !old);
                                }}
                            ></div>

                            <GenerateSidebar
                                testItems={[...multipleChoice, ...identification, ...essay]}
                                selectingSubject={selectingSubject}
                                availableChapters={availableChapters}
                                selectingAvailableChapters={selectingAvailableChapters}
                                selectedChapters={selectedChapters}
                                specificationMultipleChoice={specificationMultipleChoice}
                                specificationIdentification={specificationIdentification}
                                specificationEssay={specificationEssay}
                                updateCount={updateCount}
                            />
                        </div>
                    </div>
                    <div className="column is-8 question-interface small-main-interface">
                        <Navigation />

                        {/** Button for small screen to draw in and out the sidebar */}
                        <div
                            className="small-drawer-button"
                            onClick={() => {
                                setDrawer((old) => !old);
                            }}
                        >
                            <span></span>
                        </div>

                        {/** Page title */}
                        <div className="px-5 w-100">
                            <h1 className="title">GENERATE</h1>
                        </div>

                        <br />
                        <TestPaperViewer
                            multipleChoice={finalMultipleChoice}
                            identification={finalIdentification}
                            essay={finalEssay}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Generate;
