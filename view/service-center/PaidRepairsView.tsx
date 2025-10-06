"use client";

import React from "react";
import CompletedRepairsView from "./CompletedRepairsView";

const PaidRepairsView = () => {
	return <CompletedRepairsView paymentFilter="paid" />;
};

export default PaidRepairsView;
