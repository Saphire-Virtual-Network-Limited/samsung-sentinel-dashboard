"use client";

import React, { useState } from "react";
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Button,
	Input,
	Chip,
	Card,
	CardBody,
	Switch,
	Divider,
} from "@heroui/react";
import { useDebug, AVAILABLE_ROLES, type Role } from "@/lib/debugContext";
import { getAvailablePermissions } from "@/lib/permissions";
import { Bug, RotateCcw, Settings2 } from "lucide-react";

interface DebugModalProps {
	isOpen: boolean;
	onClose: () => void;
}

const DebugModal: React.FC<DebugModalProps> = ({ isOpen, onClose }) => {
	const {
		isDebugMode,
		debugOverrides,
		setDebugRole,
		setDebugEmail,
		setDebugPermissions,
		resetDebugOverrides,
		enableDebugMode,
		disableDebugMode,
	} = useDebug();

	const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
		new Set(debugOverrides.permissions || [])
	);

	const availablePermissions = getAvailablePermissions();

	const handleRoleChange = (value: string) => {
		if (value === "") {
			setDebugRole(undefined);
		} else {
			setDebugRole(value as Role);
		}
	};

	const handleEmailChange = (value: string) => {
		if (value.trim() === "") {
			setDebugEmail(undefined);
		} else {
			setDebugEmail(value);
		}
	};

	const handlePermissionToggle = (permission: string) => {
		const newSelected = new Set(selectedPermissions);
		if (newSelected.has(permission)) {
			newSelected.delete(permission);
		} else {
			newSelected.add(permission);
		}
		setSelectedPermissions(newSelected);
		setDebugPermissions(
			newSelected.size > 0 ? Array.from(newSelected) : undefined
		);
	};

	const handleReset = () => {
		resetDebugOverrides();
		setSelectedPermissions(new Set());
	};

	const handleDebugModeToggle = (enabled: boolean) => {
		if (enabled) {
			enableDebugMode();
		} else {
			disableDebugMode();
			setSelectedPermissions(new Set());
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="2xl"
			scrollBehavior="inside"
			classNames={{
				base: "bg-gray-900 text-white",
				header: "border-b border-gray-700",
				body: "py-6",
				footer: "border-t border-gray-700",
			}}
		>
			<ModalContent>
				<ModalHeader className="flex items-center gap-2">
					<Bug className="text-orange-500" size={20} />
					<span>Debug Console</span>
					<Chip color="warning" size="sm" variant="flat">
						Development Only
					</Chip>
				</ModalHeader>

				<ModalBody>
					<Card className="bg-gray-800 border-gray-700">
						<CardBody className="space-y-4">
							{/* Debug Mode Toggle */}
							<div className="flex items-center justify-between">
								<div>
									<h3 className="text-lg font-semibold text-white">
										Debug Mode
									</h3>
									<p className="text-sm text-gray-400">
										Enable role and permission overrides
									</p>
								</div>
								<Switch
									isSelected={isDebugMode}
									onValueChange={handleDebugModeToggle}
									color="warning"
								/>
							</div>

							{isDebugMode && (
								<>
									<Divider className="bg-gray-700" />

									{/* Role Override */}
									<div className="space-y-2">
										<label className="text-sm font-medium text-gray-300">
											Override Role
										</label>
										<select
											value={debugOverrides.role || ""}
											onChange={(e) => handleRoleChange(e.target.value)}
											className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
										>
											<option value="">No Override (Use Original Role)</option>
											{AVAILABLE_ROLES.map((role) => (
												<option key={role} value={role}>
													{role
														.replace(/_/g, " ")
														.toLowerCase()
														.replace(/\b\w/g, (l) => l.toUpperCase())}
												</option>
											))}
										</select>
										{debugOverrides.role && (
											<p className="text-xs text-orange-400">
												Currently overriding role to:{" "}
												<strong>{debugOverrides.role}</strong>
											</p>
										)}
									</div>

									{/* Email Override */}
									<div className="space-y-2">
										<label className="text-sm font-medium text-gray-300">
											Override Email (for permission checks)
										</label>
										<Input
											placeholder="Enter email for permission overrides"
											value={debugOverrides.email || ""}
											onChange={(e) => handleEmailChange(e.target.value)}
											classNames={{
												base: "text-white",
												input: "bg-gray-700 border-gray-600 text-white",
											}}
										/>
										{debugOverrides.email && (
											<p className="text-xs text-orange-400">
												Permission checks will use:{" "}
												<strong>{debugOverrides.email}</strong>
											</p>
										)}
									</div>

									{/* Permission Overrides */}
									<div className="space-y-2">
										<label className="text-sm font-medium text-gray-300">
											Override Permissions
										</label>
										<p className="text-xs text-gray-400 mb-3">
											Select permissions to force grant (bypasses role-based
											permissions)
										</p>
										<div className="max-h-48 overflow-y-auto space-y-2 p-3 bg-gray-700 rounded-lg">
											{availablePermissions.map((permission) => (
												<div
													key={permission}
													className="flex items-center justify-between py-1"
												>
													<span className="text-sm text-gray-200">
														{permission}
													</span>
													<Switch
														size="sm"
														isSelected={selectedPermissions.has(permission)}
														onValueChange={() =>
															handlePermissionToggle(permission)
														}
														color="warning"
													/>
												</div>
											))}
										</div>
										{selectedPermissions.size > 0 && (
											<div className="flex flex-wrap gap-1 mt-2">
												{Array.from(selectedPermissions).map((permission) => (
													<Chip
														key={permission}
														size="sm"
														color="warning"
														variant="flat"
														onClose={() => handlePermissionToggle(permission)}
													>
														{permission}
													</Chip>
												))}
											</div>
										)}
									</div>

									{/* Active Overrides Summary */}
									{(debugOverrides.role ||
										debugOverrides.email ||
										(debugOverrides.permissions &&
											debugOverrides.permissions.length > 0)) && (
										<>
											<Divider className="bg-gray-700" />
											<div className="space-y-2">
												<h4 className="text-sm font-semibold text-orange-400 flex items-center gap-2">
													<Settings2 size={16} />
													Active Debug Overrides
												</h4>
												{debugOverrides.role && (
													<p className="text-xs text-gray-300">
														<strong>Role:</strong> {debugOverrides.role}
													</p>
												)}
												{debugOverrides.email && (
													<p className="text-xs text-gray-300">
														<strong>Email:</strong> {debugOverrides.email}
													</p>
												)}
												{debugOverrides.permissions &&
													debugOverrides.permissions.length > 0 && (
														<p className="text-xs text-gray-300">
															<strong>Permissions:</strong>{" "}
															{debugOverrides.permissions.length} override(s)
														</p>
													)}
											</div>
										</>
									)}
								</>
							)}
						</CardBody>
					</Card>
				</ModalBody>

				<ModalFooter>
					<Button
						color="danger"
						variant="light"
						onPress={handleReset}
						startContent={<RotateCcw size={16} />}
						disabled={!isDebugMode}
					>
						Reset All
					</Button>
					<Button color="primary" onPress={onClose}>
						Close
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

export default DebugModal;
