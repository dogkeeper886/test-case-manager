# Test Plan: AP Group Level Configuration Features

## Overview

This test plan covers the testing of new AP Group level configuration features with hierarchical inheritance capabilities. The plan builds upon the existing system's three-tier configuration hierarchy (Venue > AP Group > AP) and adds comprehensive testing for the new features.

## New Features Under Test

### Feature Set A: AP Group Level Client Admission Control
- **Description**: Client Admission Control configuration at AP Group level
- **Inheritance**: AP level can inherit AP Group Client Admission Control settings
- **Override Hierarchy**: AP Level > AP Group Level > Venue Level

### Feature Set B: AP Group Level External Antenna Configuration  
- **Description**: External antenna configuration at AP Group level
- **Inheritance**: AP level can inherit AP Group external antenna settings
- **Override Hierarchy**: AP Level > AP Group Level > Venue Level

## Test Strategy

### Configuration Inheritance Testing
1. **Venue to AP Group Inheritance**: Verify AP Groups inherit venue configurations when not explicitly configured
2. **AP Group to AP Inheritance**: Verify APs inherit AP Group configurations when not explicitly configured  
3. **Configuration Override Testing**: Verify higher precedence levels override lower levels
4. **Mixed Inheritance Scenarios**: Test combinations of configured and inherited settings

### Configuration Override Testing
1. **Venue → AP Group Override**: AP Group settings override venue settings
2. **AP Group → AP Override**: AP settings override AP Group settings
3. **Venue → AP Direct Override**: AP settings override venue settings (bypassing AP Group)
4. **Complete Override Chain**: Test full Venue → AP Group → AP override chain

---

## Test Cases: AP Group Level Client Admission Control

### Test Case APGCAC-001: AP Group CAC Basic Configuration
**Objective**: Verify Client Admission Control can be configured at AP Group level

**Preconditions**: 
- User has venue.wifi-u permissions
- AP Group exists within venue
- Load Balancing is disabled at venue level
- System supports AP Group level CAC configuration

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to AP Group configuration page | AP Group configuration interface loads |
| 2 | Access Client Admission Control section | CAC configuration options visible at AP Group level |
| 3 | Enable CAC for 2.4 GHz (Min clients=20, Min load=75%, Min throughput=5) | AP Group 2.4 GHz CAC configured successfully |
| 4 | Enable CAC for 5 GHz (Min clients=30, Min load=85%, Min throughput=15) | AP Group 5 GHz CAC configured successfully |
| 5 | Apply configuration | AP Group CAC settings saved and active |
| 6 | Verify configuration persistence | Settings persist after page refresh |

**Priority**: High

### Test Case APGCAC-002: AP Group CAC Inherits from Venue
**Objective**: Verify AP Group inherits venue CAC settings when not explicitly configured

**Preconditions**: 
- Venue has CAC configured (Min clients=15, Min load=70%, Min throughput=0)
- AP Group exists with no CAC configuration
- Load Balancing disabled

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Configure venue CAC (2.4G: 15/70%/0, 5G: 15/70%/0) | Venue CAC baseline established |
| 2 | Navigate to AP Group configuration | AP Group CAC section shows inheritance |
| 3 | Verify inherited values display | AP Group shows venue values with inheritance indicators |
| 4 | Check inheritance UI indicators | Clear "inherited from venue" labels/icons visible |
| 5 | Verify operational behavior | AP Group operates with inherited venue CAC settings |

**Priority**: High

### Test Case APGCAC-003: AP Group CAC Overrides Venue Settings
**Objective**: Verify AP Group CAC settings override venue CAC settings

**Preconditions**: 
- Venue CAC configured (Min clients=15, Min load=70%, Min throughput=0)  
- AP Group exists within venue
- Load Balancing disabled

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Verify venue baseline CAC (15/70%/0 for both bands) | Venue configuration confirmed |
| 2 | Configure AP Group CAC with different values (25/80%/10) | AP Group CAC configured differently from venue |
| 3 | Navigate to AP Group configuration view | AP Group shows its own CAC values, not venue values |
| 4 | Verify override indicators in UI | UI clearly shows AP Group overrides venue settings |
| 5 | Test with APs assigned to group | APs in group use AP Group CAC, not venue CAC |

**Priority**: High

### Test Case APGCAC-004: AP Inherits AP Group CAC Settings
**Objective**: Verify AP inherits CAC settings from assigned AP Group

**Preconditions**: 
- Venue has CAC configured
- AP Group has different CAC configuration  
- AP available for assignment to AP Group
- Load Balancing disabled

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Configure venue CAC (15/70%/0) | Venue baseline established |
| 2 | Configure AP Group CAC (25/80%/10) | AP Group override configured |
| 3 | Assign AP to the AP Group | AP assignment successful |
| 4 | Navigate to AP configuration page | AP shows inherited AP Group CAC settings |
| 5 | Verify inheritance display | AP shows 25/80%/10 with "inherited from AP Group" indicators |
| 6 | Test operational behavior | AP enforces AP Group CAC parameters (25/80%/10) |

**Priority**: High

### Test Case APGCAC-005: AP Overrides AP Group CAC Settings
**Objective**: Verify AP-specific CAC settings override AP Group settings

**Preconditions**: 
- Venue CAC configured (15/70%/0)
- AP Group CAC configured (25/80%/10)  
- AP assigned to AP Group
- System supports 3-level hierarchy

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Verify AP inherits AP Group CAC (25/80%/10) | Inheritance confirmed |
| 2 | Configure AP-specific CAC (20/75%/5) | AP-specific CAC configured |
| 3 | Apply AP configuration | AP-specific settings saved |
| 4 | Verify final configuration | AP uses its own settings (20/75%/5), not group settings |
| 5 | Check hierarchy display | UI shows AP overrides AP Group and venue |
| 6 | Test operational enforcement | AP enforces AP-specific CAC parameters exclusively |

**Priority**: High

### Test Case APGCAC-006: Mixed CAC Inheritance Scenarios
**Objective**: Test mixed scenarios where some parameters inherit and others override

**Preconditions**: 
- Venue CAC configured for both bands
- AP Group partially configured (only 2.4 GHz)
- AP supports both bands

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Configure venue CAC (2.4G: 15/70%/0, 5G: 15/70%/0) | Venue baseline for both bands |
| 2 | Configure AP Group CAC only for 2.4 GHz (25/80%/10) | AP Group overrides 2.4 GHz only |
| 3 | Assign AP to AP Group | AP assignment successful |
| 4 | Verify AP 2.4 GHz settings | AP shows AP Group 2.4 GHz settings (25/80%/10) |
| 5 | Verify AP 5 GHz settings | AP shows inherited venue 5 GHz settings (15/70%/0) |
| 6 | Test mixed operational behavior | AP enforces different sources per band |

**Priority**: Medium

---

## Test Cases: AP Group Level External Antenna Configuration

### Test Case APGANT-001: AP Group External Antenna Basic Configuration
**Objective**: Verify external antenna can be configured at AP Group level

**Preconditions**: 
- User has venue.wifi-u permissions
- AP Group exists with mixed AP models (E510, T350SE, T750SE, T670SN)
- System supports AP Group level antenna configuration

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to AP Group antenna configuration | AP Group antenna section accessible |
| 2 | Configure 2.4 GHz antenna settings (Enable=true, Gain=5dBi) | 2.4 GHz antenna configured at AP Group level |
| 3 | Configure 5 GHz antenna settings (Enable=true, Gain=8dBi) | 5 GHz antenna configured at AP Group level |
| 4 | Apply configuration | AP Group antenna settings saved |
| 5 | Verify configuration affects appropriate AP models | Settings applied to compatible APs in group |

**Priority**: High

### Test Case APGANT-002: AP Group Antenna Inherits from Venue
**Objective**: Verify AP Group inherits venue antenna settings when not configured

**Preconditions**: 
- Venue has antenna configuration (2.4G: Enable/3dBi, 5G: Enable/6dBi)
- AP Group exists with no antenna configuration
- APs assigned to group

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Configure venue antenna settings (2.4G: Enable/3dBi, 5G: Enable/6dBi) | Venue antenna baseline established |
| 2 | Navigate to AP Group antenna configuration | AP Group shows inherited antenna settings |
| 3 | Verify inheritance indicators | Clear "inherited from venue" labels visible |
| 4 | Check APs in group | APs operate with venue antenna settings via group inheritance |

**Priority**: High

### Test Case APGANT-003: AP Group Antenna Overrides Venue Settings  
**Objective**: Verify AP Group antenna settings override venue settings

**Preconditions**: 
- Venue antenna configured (2.4G: Enable/3dBi, 5G: Enable/6dBi)
- AP Group exists within venue
- APs available for group assignment

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Verify venue antenna baseline (Enable/3dBi, Enable/6dBi) | Venue configuration confirmed |
| 2 | Configure AP Group antenna differently (2.4G: Enable/5dBi, 5G: Disable/0dBi) | AP Group overrides venue settings |
| 3 | Assign APs to AP Group | APs use AP Group antenna settings |
| 4 | Verify override behavior | APs in group operate with 5dBi/Disabled, not venue settings |
| 5 | Check inheritance UI | UI shows AP Group overrides venue antenna |

**Priority**: High

### Test Case APGANT-004: AP Inherits AP Group Antenna Settings
**Objective**: Verify APs inherit antenna settings from assigned AP Group

**Preconditions**: 
- Venue has antenna configuration
- AP Group has different antenna configuration
- APs available for assignment with compatible models

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Configure venue antenna (2.4G: Enable/3dBi, 5G: Enable/6dBi) | Venue baseline established |
| 2 | Configure AP Group antenna (2.4G: Enable/5dBi, 5G: Enable/8dBi) | AP Group override configured |
| 3 | Assign compatible APs to AP Group | AP assignment successful |
| 4 | Navigate to AP antenna configuration | APs show inherited AP Group antenna settings |
| 5 | Verify inheritance display | APs show 5dBi/8dBi with "inherited from AP Group" indicators |
| 6 | Test antenna operational behavior | APs operate with AP Group antenna parameters |

**Priority**: High

### Test Case APGANT-005: AP Overrides AP Group Antenna Settings
**Objective**: Verify AP-specific antenna settings override AP Group settings

**Preconditions**: 
- Venue antenna configured (3dBi/6dBi)
- AP Group antenna configured (5dBi/8dBi)
- AP assigned to AP Group

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Verify AP inherits AP Group antenna (5dBi/8dBi) | Inheritance confirmed |
| 2 | Configure AP-specific antenna (2.4G: Enable/4dBi, 5G: Disable/0dBi) | AP-specific antenna configured |
| 3 | Apply AP configuration | AP-specific settings override group settings |
| 4 | Verify final antenna configuration | AP uses 4dBi/Disabled, not group 5dBi/8dBi |
| 5 | Check operational antenna behavior | AP enforces AP-specific antenna parameters |

**Priority**: High

### Test Case APGANT-006: Model-Specific Antenna Inheritance - E510
**Objective**: Verify E510 model-specific antenna inheritance through AP Group

**Preconditions**: 
- E510 AP models available
- AP Group configured for E510 antenna parameters
- System supports model-specific inheritance

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Configure AP Group for E510 (Enable 2.4G: true, Enable 5G: true, Gains: 5dBi/8dBi) | E510-specific AP Group configuration |
| 2 | Assign E510 APs to AP Group | E510 APs assigned successfully |
| 3 | Navigate to E510 AP configuration | E510 shows inherited AP Group settings |
| 4 | Verify E510-specific parameters | Enable toggles and gain settings inherited correctly |
| 5 | Test E510 antenna operation | E510 operates with inherited group antenna configuration |

**Priority**: High

### Test Case APGANT-007: Model-Specific Antenna Inheritance - T670SN
**Objective**: Verify T670SN antenna type inheritance through AP Group

**Preconditions**: 
- T670SN AP models available  
- AP Group configured with T670SN antenna type selection
- System supports model-specific antenna types

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Configure AP Group T670SN antenna (Type: Sector) | AP Group configured with Sector antenna type |
| 2 | Assign T670SN APs to AP Group | T670SN assignment successful |
| 3 | Navigate to T670SN AP configuration | AP shows inherited Sector antenna type |
| 4 | Verify antenna type inheritance | T670SN displays "Sector" inherited from AP Group |
| 5 | Override at AP level (Type: Narrow) | AP-specific override to Narrow type |
| 6 | Confirm override precedence | AP uses Narrow type, overriding group Sector type |

**Priority**: High

---

## Configuration Override Chain Test Cases

### Test Case CHAIN-001: Complete Override Chain - CAC
**Objective**: Test complete Venue → AP Group → AP override chain for Client Admission Control

**Preconditions**: 
- System supports 3-level hierarchy
- Venue, AP Group, and AP all support CAC configuration
- Load Balancing disabled

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Configure venue CAC (15/70%/0) | Venue baseline established |
| 2 | Configure AP Group CAC (25/80%/10) | AP Group overrides venue |
| 3 | Configure AP CAC (20/75%/5) | AP overrides AP Group |
| 4 | Verify final AP configuration | AP uses 20/75%/5 (highest precedence) |
| 5 | Remove AP override | AP reverts to AP Group settings (25/80%/10) |
| 6 | Remove AP Group override | AP reverts to venue settings (15/70%/0) |
| 7 | Test configuration chain UI | UI clearly shows override chain and precedence |

**Priority**: High

### Test Case CHAIN-002: Complete Override Chain - Antenna
**Objective**: Test complete Venue → AP Group → AP override chain for antenna configuration

**Preconditions**: 
- System supports 3-level hierarchy for antenna
- Compatible AP models available
- All levels support antenna configuration

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Configure venue antenna (3dBi/6dBi, both enabled) | Venue antenna baseline |
| 2 | Configure AP Group antenna (5dBi/8dBi, both enabled) | AP Group overrides venue |
| 3 | Configure AP antenna (4dBi/7dBi, 2.4G enabled, 5G disabled) | AP overrides AP Group |
| 4 | Verify final AP antenna | AP uses 4dBi/disabled (highest precedence) |
| 5 | Remove AP override | AP reverts to AP Group (5dBi/8dBi, both enabled) |
| 6 | Remove AP Group override | AP reverts to venue (3dBi/6dBi, both enabled) |
| 7 | Verify operational antenna behavior | Antenna operates per active configuration level |

**Priority**: High

### Test Case CHAIN-003: Partial Override Scenarios
**Objective**: Test scenarios where only some levels have configurations

**Test Data**:
- Scenario A: Venue + AP (no AP Group config)
- Scenario B: AP Group + AP (no venue config)  
- Scenario C: Venue only (no group or AP config)

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Test Scenario A: Configure venue CAC, assign AP directly | AP inherits venue CAC directly |
| 2 | Override at AP level | AP overrides venue, skipping AP Group |
| 3 | Test Scenario B: Configure AP Group CAC only | AP inherits AP Group CAC |
| 4 | Test Scenario C: Configure venue CAC only | All APs and groups inherit venue CAC |
| 5 | Verify inheritance skipping works correctly | System handles missing configuration levels |

**Priority**: Medium

---

## Cross-Feature Interaction Test Cases

### Test Case CROSS-001: CAC and Antenna Inheritance Independence
**Objective**: Verify CAC and antenna inheritance operate independently

**Preconditions**: 
- AP Group supports both CAC and antenna configuration
- System allows independent configuration of features

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Configure venue CAC (15/70%/0) and antenna (3dBi/6dBi) | Venue baseline for both features |
| 2 | Configure AP Group CAC only (25/80%/10) | AP Group overrides CAC only |
| 3 | Assign AP to AP Group | AP inherits group CAC and venue antenna |
| 4 | Verify independent inheritance | AP shows group CAC + venue antenna |
| 5 | Configure AP Group antenna (5dBi/8dBi) | AP Group now overrides both features |
| 6 | Verify both features inherited from group | AP shows group CAC + group antenna |

**Priority**: Medium

### Test Case CROSS-002: Load Balancing Conflict at AP Group Level
**Objective**: Verify Load Balancing and AP Group CAC mutual exclusivity

**Preconditions**: 
- Venue has Load Balancing enabled
- AP Group supports CAC configuration
- System enforces mutual exclusivity

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Enable Load Balancing at venue level | Load Balancing active at venue |
| 2 | Attempt to configure CAC at AP Group level | System prevents CAC configuration |
| 3 | Display appropriate error message | Clear error explaining Load Balancing conflict |
| 4 | Disable Load Balancing at venue | Load Balancing deactivated |
| 5 | Configure CAC at AP Group level | AP Group CAC configuration succeeds |
| 6 | Attempt to re-enable Load Balancing | System prevents Load Balancing activation |

**Priority**: High

---

## Performance and Scale Test Cases

### Test Case PERF-001: AP Group Configuration Propagation  
**Objective**: Verify AP Group configuration changes propagate to APs within required timeframe

**Preconditions**: 
- AP Group with 100+ assigned APs
- APs online and communicating with management system
- Performance monitoring tools available

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Record baseline configuration state | Current AP configurations documented |
| 2 | Make AP Group CAC configuration change | Configuration saved with timestamp |
| 3 | Monitor propagation to assigned APs | Configuration updates detected on APs |
| 4 | Measure propagation completion time | All APs updated within 30 seconds |
| 5 | Verify configuration consistency | All APs have identical group-inherited config |

**Priority**: Medium

### Test Case PERF-002: Large Scale AP Group Testing
**Objective**: Test AP Group functionality with maximum supported APs (10,000)

**Preconditions**: 
- Test environment capable of simulating 10,000 APs
- AP Group with maximum capacity
- Performance monitoring capabilities

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Create AP Group with 10,000 simulated APs | AP Group creation succeeds |
| 2 | Configure AP Group CAC and antenna settings | Configuration applied successfully |
| 3 | Monitor system performance during configuration | System remains responsive |
| 4 | Verify inheritance to all 10,000 APs | All APs inherit group configuration |
| 5 | Test configuration override at scale | System handles overrides without degradation |

**Priority**: Low

---

## Test Environment Requirements

### Hardware/Infrastructure:
- Multiple AP models (E510, T350SE, T750SE, T670SN, R760)
- Test clients for multiple frequency bands
- Network infrastructure supporting large-scale testing

### Software Requirements:
- WiFi management system with AP Group level configuration support
- Database with hierarchical configuration capabilities
- Performance monitoring tools

### Access Requirements:
- User accounts with venue.wifi-u permissions
- Administrative access to AP Group management
- Database access for configuration validation

---

## Test Data Requirements

### Configuration Test Data:
- Venue-level baseline configurations
- AP Group-level override configurations  
- AP-level override configurations
- Invalid parameter sets for validation testing

### Scale Testing Data:
- Large AP Group configurations (1,000+ APs)
- Multiple concurrent user sessions
- Bulk configuration change scenarios

---

## Success Criteria

### Functional Requirements:
- All AP Group level configurations work correctly
- Configuration inheritance follows Venue → AP Group → AP hierarchy
- Configuration overrides work at each level
- Cross-feature interactions work independently

### Performance Requirements:
- Configuration propagation completes within 30 seconds
- System supports up to 10,000 APs per AP Group
- API responses complete within 2 seconds
- No degradation in system responsiveness

### Quality Requirements:
- Configuration data integrity maintained
- Clear UI indication of inheritance and overrides
- Proper error handling for invalid configurations
- Comprehensive audit logging of configuration changes

---

## Risk Mitigation

### Technical Risks:
- **Configuration conflicts**: Implement clear precedence rules and validation
- **Performance degradation**: Implement efficient inheritance resolution algorithms
- **Data consistency**: Use database transactions for configuration changes

### Operational Risks:
- **User confusion**: Provide clear UI indicators for inheritance and overrides
- **Misconfiguration**: Implement validation and confirmation steps
- **Rollback scenarios**: Ensure configuration changes can be reverted

This comprehensive test plan ensures thorough validation of the new AP Group level configuration features while maintaining compatibility with existing system functionality.