"use client";
import React, { useMemo, useState } from "react";
import { getAllAgentsLoansAndCommissions } from "@/lib/api";
import { Tabs, Tab } from "@heroui/react";
import CommissionTable from "./CommissionTable";
import AgentCommissionTable from "./AgentCommissionTable";
import PartnerCommissionTable from "./PartnerCommissionTable";
import CommissionSummaryTable from "./CommissionSummaryTable";

const CommissionReportsView: React.FC = () => {
	const [tab, setTab] = useState("commissions");

	// Tabs expects (key: Key) => void
	const handleTabChange = (key: React.Key) => {
		setTab(String(key));
	};

	return (
		<div>
			<Tabs selectedKey={tab} onSelectionChange={handleTabChange}>
				<Tab key="commissions" title="Commissions">
					<CommissionTable />
				</Tab>
				<Tab key="agent" title="Agent Commission">
					<AgentCommissionTable />
				</Tab>
				<Tab key="partner" title="Partner Commission">
					<PartnerCommissionTable />
				</Tab>
				<Tab key="summary" title="Commission Summary">
					<CommissionSummaryTable />
				</Tab>
			</Tabs>
		</div>
	);
};

export default CommissionReportsView;
