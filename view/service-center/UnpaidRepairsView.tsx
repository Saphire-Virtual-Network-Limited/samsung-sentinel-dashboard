"use client";

import React from "react";
import CompletedRepairsView from "./CompletedRepairsView";

const UnpaidRepairsView = () => {
	return <CompletedRepairsView paymentFilter="unpaid" />;
};

export default UnpaidRepairsView;
