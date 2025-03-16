<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
	<defs>
		<linearGradient id="teleportGradient" x1="0%" y1="0%" x2="100%" y2="100%">
			<stop offset="0%" style="stop-color:#9CCFD8;stop-opacity:0.8" />
			<stop offset="100%" style="stop-color:#EB98B3;stop-opacity:0.8" />
		</linearGradient>

		<filter id="energyEffect">
			<feGaussianBlur stdDeviation="3" result="blur" />
			<feDisplacementMap
				in="SourceGraphic"
				in2="blur"
				scale="5"
				xChannelSelector="R"
				yChannelSelector="G"
			/>
			<feComponentTransfer>
				<feFuncA type="discrete" tableValues="0 1 1 1" />
			</feComponentTransfer>
		</filter>
	</defs>

	<!-- Teleportation connection -->
	<path
		d="M25,75 Q50,25 75,25"
		fill="none"
		stroke="url(#teleportGradient)"
		stroke-width="4"
		stroke-linecap="round"
		filter="url(#energyEffect)"
	>
		<animate
			attributeName="stroke-dasharray"
			values="5,20;20,5;5,20"
			dur="2s"
			repeatCount="indefinite"
		/>
		<animate
			attributeName="d"
			values="M25,75 Q50,25 75,25;M25,75 Q50,50 75,25;M25,75 Q50,25 75,25"
			dur="3s"
			repeatCount="indefinite"
		/>
	</path>

	<!-- Origin point -->
	<circle cx="25" cy="75" r="10" fill="#9CCFD8" filter="url(#energyEffect)">
		<animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite" />
		<animate attributeName="cy" values="75;70;75" dur="3s" repeatCount="indefinite" />
	</circle>

	<!-- Destination point -->
	<circle cx="75" cy="25" r="10" fill="#EB98B3" filter="url(#energyEffect)">
		<animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite" />
		<animate attributeName="cy" values="25;30;25" dur="3s" repeatCount="indefinite" />
	</circle>
</svg>
