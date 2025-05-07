"use client";

import React, { JSX } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, Button, Input, Switch } from "@heroui/react";
import { Search, ChevronLeft } from "lucide-react";
import { cn } from "@/lib";

type SelectionModalProps = {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	titleSize?: string;
	options: string[];
	selectedOptions: string[];
	onOptionToggle: (option: string) => void;
	onNextClick: () => void;
	openToAll: boolean;
	onToggleAll: (checked: boolean) => void;
	searchQuery: string;
	onSearchChange: (query: string) => void;
	placeholder: string;
	closeHandler: () => void;
	renderOption?: (option: string) => JSX.Element;
};

const SelectionModal: React.FC<SelectionModalProps> = ({ isOpen, onOpenChange, title, options, selectedOptions, onOptionToggle, onNextClick, openToAll, onToggleAll, searchQuery, onSearchChange, placeholder, closeHandler, renderOption }) => {
	const filteredOptions = options.filter((option) => option.toLowerCase().includes(searchQuery.toLowerCase()));

	return (
		<Modal
			isOpen={isOpen}
			hideCloseButton
			isDismissable={false}
			isKeyboardDismissDisabled={false}
			backdrop="blur"
			onOpenChange={onOpenChange}
			scrollBehavior="inside"
			classNames={{
				base: "rounded-tl-[2em] rounded-tr-[2em] rounded-bl-none rounded-br-none md:rounded-large",
			}}>
			<ModalContent className="p-2 py-4">
				{() => (
					<>
						<div>
							<ChevronLeft
								onClick={closeHandler}
								className="ms-2 mt-3"
							/>
						</div>
						<ModalHeader className="flex flex-col gap-1 justify-center text-center pt-4 pb-8">
							<h1 className={cn("text-xl w-[95%] m-auto")}>{title}</h1>
						</ModalHeader>
						<ModalBody>
							<div className="p-4 space-y-6">
								<div className="flex items-center justify-between">
									<span className="text-sm">I&apos;m open to all</span>
									<Switch
										checked={openToAll}
										onChange={(e) => onToggleAll(e.target.checked)}
									/>
								</div>

								<div>
									<Input
										placeholder={placeholder}
										value={searchQuery}
										onChange={(e) => onSearchChange(e.target.value)}
										disabled={openToAll}
										startContent={<Search className=" text-gray-500 h-4 w-4" />}
									/>
								</div>

								<div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-16">
									{filteredOptions.map((option) => (
										<Button
											key={option}
											variant={selectedOptions.includes(option) ? "solid" : "bordered"}
											className="justify-start h-auto py-2 px-4 min-h-[48px] text-sm whitespace-normal break-words"
											onPress={() => onOptionToggle(option)}
											disabled={openToAll}>
											<div className="flex items-center w-full">
												<div className="flex-1 text-left">{renderOption ? renderOption(option) : option}</div>
												<span className="flex-shrink-0 ml-2">{selectedOptions.includes(option) ? "×" : "+"}</span>
											</div>
										</Button>
									))}
								</div>

								<div className="fixed bottom-4 left-0 right-0 mx-8">
									<Button
										className="w-full bg-primary text-white mt-8 py-6 rounded-full"
										onPress={onNextClick}>
										Continue
									</Button>
								</div>
							</div>
						</ModalBody>
					</>
				)}
			</ModalContent>
		</Modal>
	);
};

export default SelectionModal;
